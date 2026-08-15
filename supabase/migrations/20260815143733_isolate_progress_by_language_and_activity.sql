begin;

alter table public.user_progress
  add column language_id text,
  add column activity text;

-- The original cloud release only stored Dutch Word Builders progress.
update public.user_progress
set language_id = 'nl', activity = 'word_builders'
where language_id is null or activity is null;

alter table public.user_progress
  alter column language_id set not null,
  alter column activity set not null,
  drop constraint user_progress_pkey,
  drop constraint user_progress_level_check,
  add constraint user_progress_language_id_check
    check (language_id ~ '^[a-z][a-z0-9-]{1,34}$'),
  add constraint user_progress_activity_check
    check (activity in ('word_builders', 'tracing', 'math')),
  add constraint user_progress_level_check
    check (level between 1 and 100),
  add primary key (user_id, language_id, activity, level);

comment on column public.user_progress.language_id is 'Learning-language package id, such as nl, en, or fa.';
comment on column public.user_progress.activity is 'Progress namespace: word_builders, tracing, or math.';

alter table public.user_progress enable row level security;

drop policy if exists "Users can read own progress" on public.user_progress;
drop policy if exists "Users can insert own progress" on public.user_progress;
drop policy if exists "Users can update own progress" on public.user_progress;

create policy "Users can read own progress"
on public.user_progress for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert own progress"
on public.user_progress for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update own progress"
on public.user_progress for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

revoke all on table public.user_progress from anon, authenticated;
grant select, insert, update on table public.user_progress to authenticated;

commit;
