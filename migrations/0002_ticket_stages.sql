create table if not exists ticket_stages (
  id text primary key,
  label text not null,
  sort_order int not null,
  enabled boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  quota_vvip int not null default 0,
  quota_vip int not null default 0,
  quota_festival int not null default 0
);

insert into ticket_stages (id, label, sort_order, enabled, quota_vvip, quota_vip, quota_festival)
values
  ('early_bird', 'Early Bird', 1, true, 0, 200, 500),
  ('presale_1', 'Presale 1', 2, false, 50, 200, 500),
  ('presale_2', 'Presale 2', 3, false, 50, 200, 500),
  ('ots', 'OTS', 4, false, 50, 200, 500)
on conflict (id) do nothing;

alter table orders add column if not exists stage_id text references ticket_stages(id);
create index if not exists orders_stage_idx on orders (stage_id);
