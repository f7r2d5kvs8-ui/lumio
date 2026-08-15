begin;

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  anonymous_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  session_id uuid not null,
  event_name text not null check (event_name in (
    'first_open', 'session_start', 'language_selected',
    'lesson_started', 'lesson_completed', 'game_started', 'game_completed',
    'curriculum_progress', 'support_viewed', 'support_clicked'
  )),
  occurred_at timestamptz not null default now(),
  platform text not null check (platform in ('web', 'android')),
  app_version text not null check (length(app_version) between 1 and 32 and app_version ~ '^[A-Za-z0-9._+-]+$'),
  language_id text check (language_id ~ '^[a-z][a-z0-9-]{0,34}$'),
  activity_id text check (length(activity_id) between 1 and 100 and activity_id ~ '^[A-Za-z0-9._:-]+$'),
  progress_current integer check (progress_current >= 0),
  progress_total integer check (progress_total > 0),
  metadata jsonb not null default '{}'::jsonb check (
    jsonb_typeof(metadata) = 'object'
    and pg_column_size(metadata) <= 2048
    and (metadata - array['source', 'activity_type', 'completion_reason', 'variant']) = '{}'::jsonb
    and coalesce(jsonb_typeof(metadata -> 'source') = 'string' and length(metadata ->> 'source') <= 80, true)
    and coalesce(jsonb_typeof(metadata -> 'activity_type') = 'string' and length(metadata ->> 'activity_type') <= 80, true)
    and coalesce(jsonb_typeof(metadata -> 'completion_reason') = 'string' and length(metadata ->> 'completion_reason') <= 80, true)
    and coalesce(jsonb_typeof(metadata -> 'variant') in ('string', 'number', 'boolean') and length(metadata ->> 'variant') <= 80, true)
  ),
  check (progress_current is null or progress_total is null or progress_current <= progress_total)
);

comment on table public.analytics_events is 'Privacy-minimized product events shared by Lumio web and future Android clients. Raw rows are never browser-readable.';
comment on column public.analytics_events.anonymous_id is 'Random installation/browser identifier generated locally; never an advertising identifier.';
comment on column public.analytics_events.metadata is 'Small allowlisted scalar metadata only. Names, free text, location, birth dates, and device identifiers are prohibited.';

create index analytics_events_occurred_at_idx on public.analytics_events (occurred_at desc);
create index analytics_events_event_occurred_idx on public.analytics_events (event_name, occurred_at desc);
create index analytics_events_user_idx on public.analytics_events (user_id) where user_id is not null;

alter table public.analytics_events enable row level security;

create policy "Guests can submit privacy-safe analytics"
on public.analytics_events for insert
to anon
with check (
  user_id is null
  and occurred_at between now() - interval '5 minutes' and now() + interval '1 minute'
);

create policy "Users can submit their own privacy-safe analytics"
on public.analytics_events for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and occurred_at between now() - interval '5 minutes' and now() + interval '1 minute'
);

revoke all on table public.analytics_events from anon, authenticated;
grant insert on table public.analytics_events to anon, authenticated;

create or replace function public.get_lumio_analytics_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  dashboard jsonb;
begin
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'lumio_admin', 'false') <> 'true' then
    raise exception 'analytics administrator access required' using errcode = '42501';
  end if;

  with events as (
    select
      case when user_id is null then 'a:' || anonymous_id::text else 'u:' || user_id::text end as actor_id,
      session_id, event_name, occurred_at, (occurred_at at time zone 'utc')::date as event_date,
      platform, language_id, activity_id, progress_current, progress_total
    from public.analytics_events
  ),
  first_seen as (
    select actor_id, min(event_date) as first_date from events group by actor_id
  ),
  period_values as (
    select * from (values ('today'::text, 1), ('last_7_days'::text, 7), ('last_30_days'::text, 30)) as periods(label, days)
  ),
  periods as (
    select p.label, jsonb_build_object(
      'new_users', (select count(*) from first_seen where first_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'active_users', (select count(distinct actor_id) from events where event_name = 'session_start' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'sessions', (select count(distinct session_id) from events where event_name = 'session_start' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'lessons_started', (select count(*) from events where event_name = 'lesson_started' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'lessons_completed', (select count(*) from events where event_name = 'lesson_completed' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'lesson_completion_rate', coalesce((select round(100.0 * count(*) filter (where event_name = 'lesson_completed') / nullif(count(*) filter (where event_name = 'lesson_started'), 0), 1) from events where event_date >= (now() at time zone 'utc')::date - (p.days - 1)), 0),
      'sessions_per_user', coalesce((select round(count(distinct session_id)::numeric / nullif(count(distinct actor_id), 0), 2) from events where event_name = 'session_start' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)), 0),
      'support_views', (select count(*) from events where event_name = 'support_viewed' and event_date >= (now() at time zone 'utc')::date - (p.days - 1)),
      'support_clicks', (select count(*) from events where event_name = 'support_clicked' and event_date >= (now() at time zone 'utc')::date - (p.days - 1))
    ) as metrics
    from period_values p
  ),
  retention_values as (
    select * from (values (1), (7), (30)) as offsets(days)
  ),
  retention as (
    select r.days, count(*) as eligible,
      count(*) filter (where exists (
        select 1 from events e where e.actor_id = f.actor_id and e.event_name = 'session_start' and e.event_date = f.first_date + r.days
      )) as retained
    from retention_values r
    join first_seen f on f.first_date <= (now() at time zone 'utc')::date - r.days
    group by r.days
  ),
  trend_days as (
    select generate_series((now() at time zone 'utc')::date - 29, (now() at time zone 'utc')::date, interval '1 day')::date as day
  ),
  latest_progress as (
    select distinct on (actor_id, language_id, activity_id) actor_id, language_id, activity_id, progress_current, progress_total
    from events
    where event_name = 'curriculum_progress' and progress_total is not null
    order by actor_id, language_id, activity_id, occurred_at desc
  )
  select jsonb_build_object(
    'generated_at', now(),
    'total_users', (select count(*) from first_seen),
    'periods', (select jsonb_object_agg(label, metrics) from periods),
    'retention', (select coalesce(jsonb_object_agg('d' || days, jsonb_build_object('eligible', eligible, 'retained', retained, 'rate', coalesce(round(100.0 * retained / nullif(eligible, 0), 1), 0))), '{}'::jsonb) from retention),
    'average_curriculum_progress', coalesce((select round(avg(100.0 * progress_current / nullif(progress_total, 0)), 1) from latest_progress), 0),
    'languages', (select coalesce(jsonb_agg(row_data order by users desc, event_count desc), '[]'::jsonb) from (
      select jsonb_build_object('language', coalesce(language_id, 'unknown'), 'users', count(distinct actor_id), 'events', count(*)) as row_data, count(distinct actor_id) as users, count(*) as event_count
      from events where event_date >= (now() at time zone 'utc')::date - 29 and language_id is not null group by language_id
    ) language_rows),
    'activities', (select coalesce(jsonb_agg(row_data order by starts desc), '[]'::jsonb) from (
      select jsonb_build_object('activity', activity_id, 'starts', count(*), 'users', count(distinct actor_id)) as row_data, count(*) as starts
      from events where event_name in ('lesson_started', 'game_started') and event_date >= (now() at time zone 'utc')::date - 29 and activity_id is not null group by activity_id order by starts desc limit 12
    ) activity_rows),
    'platforms', (select coalesce(jsonb_agg(row_data order by users desc), '[]'::jsonb) from (
      select jsonb_build_object('platform', platform, 'users', count(distinct actor_id), 'sessions', count(distinct session_id)) as row_data, count(distinct actor_id) as users
      from events where event_name = 'session_start' and event_date >= (now() at time zone 'utc')::date - 29 group by platform
    ) platform_rows),
    'trend', (select jsonb_agg(jsonb_build_object(
      'date', day,
      'active_users', (select count(distinct actor_id) from events where event_name = 'session_start' and event_date = day),
      'new_users', (select count(*) from first_seen where first_date = day),
      'sessions', (select count(distinct session_id) from events where event_name = 'session_start' and event_date = day),
      'completed_lessons', (select count(*) from events where event_name = 'lesson_completed' and event_date = day)
    ) order by day) from trend_days)
  ) into dashboard;

  return dashboard;
end;
$$;

comment on function public.get_lumio_analytics_dashboard() is 'Returns aggregate-only Lumio product analytics. Requires app_metadata.lumio_admin=true in the caller JWT.';
revoke all on function public.get_lumio_analytics_dashboard() from public, anon;
grant execute on function public.get_lumio_analytics_dashboard() to authenticated;

commit;
