alter table orders add column if not exists qty_community int not null default 0;

alter table ticket_stages add column if not exists quota_community int not null default 0;
alter table ticket_stages add column if not exists price_community int not null default 0;
alter table ticket_stages add column if not exists ft_price_community int not null default 0;
alter table ticket_stages add column if not exists sell_community boolean not null default false;

alter table tickets drop constraint if exists tickets_ticket_type_check;
alter table tickets add constraint tickets_ticket_type_check
  check (ticket_type in ('vvip', 'vip', 'festival', 'community'));
