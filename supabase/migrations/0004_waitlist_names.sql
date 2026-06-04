-- Add optional name fields to the waitlist (first name required at the form
-- level; last name optional). Columns are nullable so existing rows are safe.
alter table public.waitlist
  add column if not exists first_name text,
  add column if not exists last_name text;
