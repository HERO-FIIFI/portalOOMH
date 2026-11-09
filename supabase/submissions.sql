create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  ref_code text not null unique check (ref_code ~ '^OOH-[A-Z0-9]{7}$'),
  user_id uuid not null,
  entry_type text not null,
  lead_name text not null,
  phone text not null,
  email text not null,
  school text not null,
  location text not null,
  form text not null,
  other_names text,
  age_group text not null,
  guardian_name text,
  guardian_phone text,
  video_path text,
  video_link text,
  file_name text,
  file_size_mb numeric,
  duration text,
  status text not null default 'received',
  created_at timestamptz not null default now()
);

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_user_id_idx on public.submissions (user_id);

alter table public.submissions enable row level security;
revoke all on public.submissions from anon, authenticated;
