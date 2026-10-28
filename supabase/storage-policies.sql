-- Run this in Supabase SQL Editor after enabling Anonymous Sign-Ins.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'challenge-videos',
  'challenge-videos',
  false,
  1073741824,
  array['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 1073741824,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anonymous challenge users can upload videos" on storage.objects;
create policy "Anonymous challenge users can upload videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'challenge-videos'
  and (storage.foldername(name))[1] = 'entries'
  and (storage.foldername(name))[2] = (select auth.uid()::text)
);