-- ============================================================================
-- TokTak Central Cloud Database & Media Storage Schema (Supabase Free Tier)
-- นำสคริปต์นี้ไปวางใน Supabase Dashboard -> SQL Editor แล้วกด Run เพียงครั้งเดียว
-- ============================================================================

-- 1. ตารางเก็บข้อมูลโปรไฟล์ผู้ใช้ (Profiles)
create table if not exists public.toktak_profiles (
  email text primary key,
  id text not null,
  name text not null,
  handle text not null,
  avatar text not null default '',
  bio text not null default '',
  joined_date text not null default 'พ.ย. 2026',
  followers_count integer not null default 0,
  following_count integer not null default 0,
  likes_count integer not null default 0,
  is_google_verified boolean not null default true,
  role text not null default 'user',
  is_active boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 2. ตารางเก็บข้อมูลคลิปวิดีโอทั้งหมด (Videos)
create table if not exists public.toktak_videos (
  id text primary key,
  video_url text not null,
  poster_url text not null default '',
  creator_name text not null,
  creator_handle text not null,
  creator_avatar text not null default '',
  creator_email text not null,
  owner_email text,
  author_email text,
  caption text not null default '',
  music_title text not null default '',
  likes_count integer not null default 0,
  comments_count integer not null default 0,
  shares_count integer not null default 0,
  is_liked boolean not null default false,
  liked_by_emails jsonb not null default '[]'::jsonb,
  is_draft boolean not null default false,
  is_private boolean not null default false,
  feed_type text not null default 'foryou',
  linked_product jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_toktak_videos_created_at
  on public.toktak_videos (created_at desc);

create index if not exists idx_toktak_videos_author_email
  on public.toktak_videos (author_email);

-- 3. เปิดใช้งาน Row Level Security (RLS) พร้อมสิทธิ์เข้าถึงสำหรับการซิงค์ข้ามอุปกรณ์
alter table public.toktak_profiles enable row level security;
alter table public.toktak_videos enable row level security;

drop policy if exists "toktak_profiles_public_all" on public.toktak_profiles;
create policy "toktak_profiles_public_all"
  on public.toktak_profiles
  for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "toktak_videos_public_all" on public.toktak_videos;
create policy "toktak_videos_public_all"
  on public.toktak_videos
  for all
  to anon, authenticated
  using (true)
  with check (true);

-- 4. สร้าง Storage Bucket สำหรับเก็บไฟล์วิดีโอ (.mp4/.mov) และรูปโปรไฟล์/ปกคลิป
insert into storage.buckets (id, name, public, file_size_limit)
values ('toktak-media', 'toktak-media', true, 52428800)
on conflict (id) do update
  set public = true,
      file_size_limit = 52428800;

drop policy if exists "toktak_media_public_read" on storage.objects;
create policy "toktak_media_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'toktak-media');

drop policy if exists "toktak_media_public_insert" on storage.objects;
create policy "toktak_media_public_insert"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'toktak-media');

drop policy if exists "toktak_media_public_update" on storage.objects;
create policy "toktak_media_public_update"
  on storage.objects
  for update
  to anon, authenticated
  using (bucket_id = 'toktak-media')
  with check (bucket_id = 'toktak-media');

drop policy if exists "toktak_media_public_delete" on storage.objects;
create policy "toktak_media_public_delete"
  on storage.objects
  for delete
  to anon, authenticated
  using (bucket_id = 'toktak-media');

-- 5. เปิดใช้งาน Supabase Realtime เพื่อให้คอมพิวเตอร์และมือถืออัปเดตตรงกันทันทีโดยไม่ต้องรีเฟรช
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'toktak_videos'
  ) then
    alter publication supabase_realtime add table public.toktak_videos;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'toktak_profiles'
  ) then
    alter publication supabase_realtime add table public.toktak_profiles;
  end if;
end $$;
