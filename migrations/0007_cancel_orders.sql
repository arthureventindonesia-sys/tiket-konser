alter table orders drop constraint if exists orders_status_check;
alter table orders add constraint orders_status_check
  check (status in ('awaiting_payment', 'awaiting_confirm', 'confirmed', 'cancelled'));

alter table orders add column if not exists cancelled_at timestamptz;
alter table orders add column if not exists cancelled_by text;

drop index if exists orders_email_lower_uidx;
drop index if exists orders_whatsapp_norm_uidx;
create unique index if not exists orders_email_lower_uidx
  on orders (lower(email)) where status <> 'cancelled';
create unique index if not exists orders_whatsapp_norm_uidx
  on orders (whatsapp_norm) where status <> 'cancelled' and whatsapp_norm is not null;
