-- Remove the policies from the pre-migration project. Their replacements use
-- cached auth.uid() evaluation and the same strict ownership condition.
drop policy if exists "Users can read their own progress" on public.user_progress;
drop policy if exists "Users can insert their own progress" on public.user_progress;
drop policy if exists "Users can update their own progress" on public.user_progress;
