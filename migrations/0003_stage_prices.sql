alter table ticket_stages add column if not exists price_vvip int not null default 1500000;
alter table ticket_stages add column if not exists price_vip int not null default 750000;
alter table ticket_stages add column if not exists price_festival int not null default 350000;
