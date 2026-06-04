-- =====================================================================
-- Qetos — initial schema (Postgres / Supabase)
-- Row-Level Security: every row is scoped to its owner (auth.uid()).
-- pgvector powers cross-conversation "memory".
-- =====================================================================
create extension if not exists vector;

-- ---------- profile & targets ----------
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  age int,
  sex text,                       -- 'male' | 'female' | 'other'
  height_cm numeric,
  weight_kg numeric,
  goals text[] default '{}',      -- e.g. {'lower_ldl','raise_hdl','low_trig','perfect_bloodwork'}
  dietary_restrictions text[] default '{}',
  theme text default 'mint',      -- 'mint' | 'cobalt'
  location text,                  -- for grocery / store locator
  onboarded boolean default false,
  created_at timestamptz default now()
);

create table public.targets (
  user_id uuid primary key references public.profiles on delete cascade,
  net_carbs_g int default 20,
  protein_g int default 140,
  calories int,
  ketone_goal numeric default 1.5,
  daylight_min int default 20,
  updated_at timestamptz default now()
);

-- ---------- daily energy / mood ----------
create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  log_date date default current_date,
  energy_stability int,           -- 0-100
  mood text,
  notes text,
  created_at timestamptz default now()
);

-- ---------- meals ----------
create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  eaten_at timestamptz default now(),
  name text,
  kcal numeric, net_carbs_g numeric, protein_g numeric, fat_g numeric, fiber_g numeric,
  cholesterol_impact text,        -- 'raises_ldl' | 'neutral' | 'lowers_ldl'
  source text,                    -- 'photo' | 'barcode' | 'search' | 'recipe'
  image_url text,
  in_day_plan boolean default false,
  raw_json jsonb
);

-- ---------- ketones (Keto-Mojo photo) ----------
create table public.ketone_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  taken_at timestamptz default now(),
  bhb_mmol numeric,
  glucose_mgdl numeric,
  gki numeric,                    -- glucose-ketone index (computed)
  fasted boolean,
  image_url text
);

-- ---------- labs (PDF upload + parsed metrics) ----------
create table public.lab_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  uploaded_at timestamptz default now(),
  title text,
  file_url text,                  -- stored PDF in Supabase Storage
  parsed jsonb                    -- Observations / Actions / Pending labs
);
create table public.lab_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  report_id uuid references public.lab_reports on delete cascade,
  taken_on date,
  metric text,                    -- 'LDL','HDL','Triglycerides','ApoB','hsCRP','HbA1c'...
  value numeric, unit text,
  flag text                       -- 'optimal' | 'watch' | 'high' | 'low'
);

-- ---------- DRESS habits ----------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  key text, title text, body text,
  phase text,                     -- 'Breakfast' | 'Afternoon' | 'Evening Wind-Down'
  sort int default 0
);
create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  habit_id uuid references public.habits on delete cascade,
  completed_on date default current_date
);

-- ---------- wins (compassion ledger) ----------
create table public.wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  type text,                      -- 'craving' | 'habit' | 'energy'
  note text,
  created_at timestamptz default now()
);

-- ---------- supplements (user-configured, never auto-prescribed) ----------
create table public.supplements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  name text, dose text, timing text,
  active boolean default true
);
create table public.supplement_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  supplement_id uuid references public.supplements on delete cascade,
  taken_at timestamptz default now()
);

-- ---------- chat + cross-conversation memory ----------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  role text,                      -- 'user' | 'assistant'
  content text,
  created_at timestamptz default now()
);
create table public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  kind text,                      -- 'fact' | 'preference' | 'pattern' | 'summary'
  content text,
  embedding vector(768),          -- Gemini text-embedding-004
  created_at timestamptz default now()
);

-- ---------- device connections ----------
create table public.device_connections (
  user_id uuid references public.profiles on delete cascade,
  provider text,                  -- 'whoop' | 'oura' | 'cronometer' | 'keto_mojo'
  status text default 'disconnected',
  last_sync timestamptz,
  tokens jsonb,                   -- encrypted OAuth tokens
  primary key (user_id, provider)
);

-- ---------- shopping list (Food tab) ----------
create table public.shopping_list (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles on delete cascade,
  item text, qty text, store text,
  checked boolean default false,
  created_at timestamptz default now()
);

-- =====================================================================
-- Row-Level Security — owner-only access on every table
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','targets','daily_logs','meals','ketone_readings','lab_reports',
    'lab_metrics','habits','habit_completions','wins','supplements','supplement_logs',
    'chat_messages','memories','device_connections','shopping_list'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    -- profiles keys on id; everything else on user_id
    if t = 'profiles' then
      execute format($p$create policy "own_rows" on public.%I
        using (auth.uid() = id) with check (auth.uid() = id);$p$, t);
    else
      execute format($p$create policy "own_rows" on public.%I
        using (auth.uid() = user_id) with check (auth.uid() = user_id);$p$, t);
    end if;
  end loop;
end $$;

-- auto-create a profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  insert into public.targets (user_id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
