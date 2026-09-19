-- ==========================================
-- MEMORA Database Schema for Supabase Postgres
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Files table
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  filename text not null,
  storage_path text not null,
  mime_type text not null,
  size bigint not null,
  created_at timestamptz default now()
);

-- 2. Memories table
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id text null,
  title text not null,
  type text not null,
  summary text,
  source_file_id uuid references files(id) on delete set null,
  date text,
  amount numeric null,
  currency text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Important dates table
create table if not exists important_dates (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  label text not null,
  date text not null
);

-- 4. Memory tags table
create table if not exists memory_tags (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  tag text not null
);

-- 5. Memory entities table
create table if not exists memory_entities (
  id uuid primary key default gen_random_uuid(),
  memory_id uuid not null references memories(id) on delete cascade,
  entity_type text not null,
  entity_value text not null
);

-- Indexes for lightning-fast lookups
create index if not exists idx_memories_created_at on memories(created_at desc);
create index if not exists idx_important_dates_date on important_dates(date);
create index if not exists idx_memory_tags_tag on memory_tags(tag);
create index if not exists idx_memory_entities_val on memory_entities(entity_value);

-- Storage bucket creation instruction:
-- In Supabase Storage, create a bucket named 'memories' (public or private with signed URLs).
