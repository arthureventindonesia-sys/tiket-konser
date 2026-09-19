alter table staff_sessions add column if not exists last_seen_at timestamptz not null default now();

create table if not exists site_visits (
  id serial primary key,
  visitor_id text not null,
  path text not null,
  created_at timestamptz not null default now()
);
create index if not exists site_visits_created_idx on site_visits (created_at desc);
create index if not exists site_visits_visitor_day_idx on site_visits (visitor_id, created_at);
