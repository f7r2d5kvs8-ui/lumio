-- Anonymous raw-event reads are intentionally unavailable. The aggregate
-- dashboard scans by event/time, so this index only adds insert/storage cost.
drop index if exists public.analytics_events_anonymous_occurred_idx;
