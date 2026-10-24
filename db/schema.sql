create table if not exists admins (
  id serial primary key,
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null,
  summary text not null default '',
  description text not null default '',
  event_date date,
  schedule_label text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists activity_images (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  url text not null,
  public_id text,
  sort_order int not null default 0
);

create index if not exists idx_activity_images on activity_images (activity_id, sort_order);

create table if not exists login_attempts (
  id serial primary key,
  ip text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_login_attempts on login_attempts (ip, created_at)
