-- Phase 4: storage bucket + INSERT webhook for generate-audio
-- Run in the Supabase SQL Editor AFTER:
--   1. supabase functions deploy generate-audio
--   2. supabase secrets set ELEVENLABS_API_KEY=sk_...
-- Replace <SERVICE_ROLE_KEY> with Project Settings → API → service_role.

-- ---------------------------------------------------------------------------
-- Public audio bucket (URL-ul din audio_url trebuie să fie redabil de player)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('lessons_audio', 'lessons_audio', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "lessons_audio_public_read" on storage.objects;
create policy "lessons_audio_public_read"
  on storage.objects
  for select
  to public
  using (bucket_id = 'lessons_audio');

-- ---------------------------------------------------------------------------
-- Trigger: după INSERT în subchapters, apelează Edge Function-ul generate-audio
-- Payload-ul trimis automat: { type, table, schema, record, old_record }
-- timeout 60s — generarea TTS nu încape în 1s
-- ---------------------------------------------------------------------------

drop trigger if exists generate_audio_on_subchapter_insert on public.subchapters;

create trigger generate_audio_on_subchapter_insert
  after insert on public.subchapters
  for each row
  execute function supabase_functions.http_request(
    'https://sovjjnqadhmfapbobqxj.supabase.co/functions/v1/generate-audio',
    'POST',
    '{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}',
    '{}',
    '60000'
  );

-- Optional: existing seed rows do not fire INSERT. Uncomment to backfill
-- lessons that still have audio_url IS NULL (replace <SERVICE_ROLE_KEY>).
--
-- select net.http_post(
--   url := 'https://sovjjnqadhmfapbobqxj.supabase.co/functions/v1/generate-audio',
--   body := jsonb_build_object(
--     'type', 'INSERT',
--     'table', 'subchapters',
--     'schema', 'public',
--     'record', to_jsonb(s),
--     'old_record', null
--   ),
--   headers := '{"Content-Type":"application/json","Authorization":"Bearer <SERVICE_ROLE_KEY>"}'::jsonb,
--   timeout_milliseconds := 60000
-- )
-- from public.subchapters s
-- where s.audio_url is null;
