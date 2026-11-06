create table if not exists fast_track_sales (
  id int primary key,
  sell_vvip boolean not null default true,
  sell_vip boolean not null default true,
  sell_festival boolean not null default true,
  sell_community boolean not null default false
);

insert into fast_track_sales (id) values (1) on conflict (id) do nothing;
