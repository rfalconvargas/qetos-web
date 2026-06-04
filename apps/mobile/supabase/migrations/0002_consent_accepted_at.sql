-- Consent / medical disclaimer acceptance timestamp.
-- Applied via Supabase MCP (migration: add_consent_accepted_at_to_profiles).
alter table public.profiles
  add column if not exists consent_accepted_at timestamptz;

comment on column public.profiles.consent_accepted_at is
  'Timestamp when the user accepted the medical/wellness disclaimer at onboarding (null = not yet accepted).';
