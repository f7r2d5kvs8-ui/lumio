-- Supports auth.users deletion cascading into signed-in analytics events.
create index if not exists analytics_events_user_idx
on public.analytics_events (user_id)
where user_id is not null;
