-- Find Your Perfect Scent — Supabase schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "pgcrypto";

-- ============================================================
-- Fragrance attributes: mirrors/overrides Shopify metafields
-- ============================================================
create table fragrance_attributes (
  product_id text primary key,            -- Shopify product GID, e.g. gid://shopify/Product/123
  scent_families text[] not null default '{}',
  top_notes text[] not null default '{}',
  mid_notes text[] not null default '{}',
  base_notes text[] not null default '{}',
  occasions text[] not null default '{}',
  mood text,
  strength text check (strength in ('light','moderate','strong','very_strong')),
  longevity_hours int,
  projection text check (projection in ('intimate','moderate','heavy')),
  climate_fit text[] not null default '{}',
  gender_position text not null default 'unisex' check (gender_position in ('women','men','unisex')),
  classification text check (classification in ('designer','niche')),
  is_featured boolean not null default false,
  is_excluded boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Admin-configurable quiz structure
-- ============================================================
create table quiz_questions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,               -- e.g. 'gender', 'scent_families'
  label text not null,
  question_type text not null check (question_type in ('single_select','multi_select','text')),
  is_optional boolean not null default false,
  sort_order int not null,
  is_active boolean not null default true
);

create table quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid references quiz_questions(id) on delete cascade,
  value text not null,
  label text not null,
  sort_order int not null
);

-- ============================================================
-- Admin-configurable budget ranges
-- ============================================================
create table budget_ranges (
  id uuid primary key default gen_random_uuid(),
  label text not null,                    -- 'MVR 1,000–1,999'
  min_mvr numeric not null,
  max_mvr numeric,                        -- null = no upper bound
  sort_order int not null
);

insert into budget_ranges (label, min_mvr, max_mvr, sort_order) values
  ('Below MVR 1,000', 0, 999, 1),
  ('MVR 1,000–1,999', 1000, 1999, 2),
  ('MVR 2,000–2,999', 2000, 2999, 3),
  ('MVR 3,000–4,999', 3000, 4999, 4),
  ('MVR 5,000+', 5000, null, 5);

-- ============================================================
-- Scoring weights (single row, admin-editable)
-- ============================================================
create table scoring_weights (
  id int primary key default 1,
  family int not null default 25,
  notes int not null default 20,
  occasion int not null default 15,
  mood int not null default 10,
  performance int not null default 10,
  climate int not null default 10,
  budget int not null default 10,
  constraint single_row check (id = 1)
);
insert into scoring_weights (id) values (1);

-- ============================================================
-- Analytics: sessions, recommendations shown, conversions
-- ============================================================
create table quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table quiz_recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references quiz_sessions(id) on delete cascade,
  product_id text not null,
  score int not null,
  rank int not null,               -- 1-3 primary, 4-6 alternate
  created_at timestamptz not null default now()
);

create table conversions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references quiz_sessions(id) on delete cascade,
  product_id text not null,
  event text not null check (event in ('view_product','add_to_cart')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table fragrance_attributes enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table budget_ranges enable row level security;
alter table scoring_weights enable row level security;
alter table quiz_sessions enable row level security;
alter table quiz_recommendations enable row level security;
alter table conversions enable row level security;

-- Public (anon key) can READ catalogue/config tables
create policy "public read fragrance_attributes" on fragrance_attributes for select using (true);
create policy "public read quiz_questions" on quiz_questions for select using (true);
create policy "public read quiz_options" on quiz_options for select using (true);
create policy "public read budget_ranges" on budget_ranges for select using (true);
create policy "public read scoring_weights" on scoring_weights for select using (true);

-- Public (anon key) can INSERT analytics rows only — no read/update/delete
create policy "public insert quiz_sessions" on quiz_sessions for insert with check (true);
create policy "public insert quiz_recommendations" on quiz_recommendations for insert with check (true);
create policy "public insert conversions" on conversions for insert with check (true);

-- All writes to catalogue/config and all reads of analytics happen via the
-- service role key from server-only admin API routes, which bypasses RLS.
-- No additional policies are needed for that path.

create index idx_recommendations_session on quiz_recommendations(session_id);
create index idx_conversions_product on conversions(product_id);
create index idx_sessions_created on quiz_sessions(created_at);
