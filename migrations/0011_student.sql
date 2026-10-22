alter table orders add column if not exists student boolean not null default false;
alter table orders add column if not exists student_card text;
alter table orders add column if not exists student_card_mime text;

alter table ticket_stages add column if not exists st_price_vvip int;
alter table ticket_stages add column if not exists st_price_vip int;
alter table ticket_stages add column if not exists st_price_festival int;

update ticket_stages set st_price_vvip = price_vvip where st_price_vvip is null;
update ticket_stages set st_price_vip = price_vip where st_price_vip is null;
update ticket_stages set st_price_festival = price_festival where st_price_festival is null;

alter table ticket_stages alter column st_price_vvip set default 0;
alter table ticket_stages alter column st_price_vip set default 0;
alter table ticket_stages alter column st_price_festival set default 0;
alter table ticket_stages alter column st_price_vvip set not null;
alter table ticket_stages alter column st_price_vip set not null;
alter table ticket_stages alter column st_price_festival set not null;
