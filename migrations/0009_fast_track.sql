alter table orders add column if not exists fast_track boolean not null default false;

drop index if exists orders_email_lower_uidx;
drop index if exists orders_whatsapp_norm_uidx;

create unique index if not exists orders_email_lower_uidx
  on orders (lower(email))
  where status <> 'cancelled' and fast_track = false;

create unique index if not exists orders_whatsapp_norm_uidx
  on orders (whatsapp_norm)
  where status <> 'cancelled' and fast_track = false and whatsapp_norm is not null;
