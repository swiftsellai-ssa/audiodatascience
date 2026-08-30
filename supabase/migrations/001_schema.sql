-- Audio Data Science — Phase 1: database schema
-- Run in the Supabase SQL Editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Curriculum (public read)
-- ---------------------------------------------------------------------------

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text,
  sequence_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint modules_sequence_order_unique unique (sequence_order)
);

create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title varchar(255) not null,
  sequence_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chapters_module_sequence_unique unique (module_id, sequence_order)
);

create table public.subchapters (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters(id) on delete cascade,
  title varchar(255) not null,
  content_rules jsonb not null default '[]'::jsonb,
  audio_url text,
  sequence_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subchapters_chapter_sequence_unique unique (chapter_id, sequence_order),
  constraint subchapters_content_rules_is_array check (jsonb_typeof(content_rules) = 'array')
);

create index chapters_module_id_idx on public.chapters (module_id);
create index chapters_sequence_idx on public.chapters (module_id, sequence_order);

create index subchapters_chapter_id_idx on public.subchapters (chapter_id);
create index subchapters_sequence_idx on public.subchapters (chapter_id, sequence_order);

-- ---------------------------------------------------------------------------
-- User progress (owner-only)
-- ---------------------------------------------------------------------------

create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subchapter_id uuid not null references public.subchapters(id) on delete cascade,
  is_completed boolean not null default false,
  last_position_seconds integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_progress_user_subchapter_unique unique (user_id, subchapter_id),
  constraint user_progress_last_position_non_negative check (last_position_seconds >= 0)
);

create index user_progress_user_id_idx on public.user_progress (user_id);
create index user_progress_subchapter_id_idx on public.user_progress (subchapter_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create trigger modules_set_updated_at
  before update on public.modules
  for each row execute function public.set_updated_at();

create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

create trigger subchapters_set_updated_at
  before update on public.subchapters
  for each row execute function public.set_updated_at();

create trigger user_progress_set_updated_at
  before update on public.user_progress
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Curriculum: public read. Writes go through the service role (bypasses RLS),
-- used later by the generate-audio Edge Function.
-- Progress: the authenticated user may only read/write their own rows.
-- ---------------------------------------------------------------------------

alter table public.modules enable row level security;
alter table public.chapters enable row level security;
alter table public.subchapters enable row level security;
alter table public.user_progress enable row level security;

create policy "modules_public_read"
  on public.modules
  for select
  to anon, authenticated
  using (true);

create policy "chapters_public_read"
  on public.chapters
  for select
  to anon, authenticated
  using (true);

create policy "subchapters_public_read"
  on public.subchapters
  for select
  to anon, authenticated
  using (true);

create policy "user_progress_select_own"
  on public.user_progress
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "user_progress_insert_own"
  on public.user_progress
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "user_progress_update_own"
  on public.user_progress
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "user_progress_delete_own"
  on public.user_progress
  for delete
  to authenticated
  using (auth.uid() = user_id);
