-- Pre-launch phone-number waitlist (captured from the marketing landing page).
-- Applied via Supabase MCP (migration: create_waitlist).
-- Service-role writes only — RLS is enabled with NO policies, so the anon/auth
-- roles cannot read or write; the `waitlist` edge function uses the service role.
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null unique,          -- E.164, normalized server-side
  sms_consent boolean not null default false,
  goal        text,                          -- optional single qualifier
  source      text default 'landing',
  user_agent  text,
  referrer    text,
  created_at  timestamptz default now()
);

alter table public.waitlist enable row level security;
-- intentionally NO policies.

comment on table public.waitlist is 'Pre-launch phone-number waitlist captured from the marketing landing page (service-role writes only).';
