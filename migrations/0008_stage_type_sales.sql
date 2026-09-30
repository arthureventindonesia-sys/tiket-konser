alter table ticket_stages add column if not exists sell_vvip boolean;
alter table ticket_stages add column if not exists sell_vip boolean;
alter table ticket_stages add column if not exists sell_festival boolean;

update ticket_stages
set sell_vvip = case when id in ('early_bird', 'presale_1') then false else true end
where sell_vvip is null;

update ticket_stages set sell_vip = true where sell_vip is null;
update ticket_stages set sell_festival = true where sell_festival is null;

alter table ticket_stages alter column sell_vvip set default true;
alter table ticket_stages alter column sell_vip set default true;
alter table ticket_stages alter column sell_festival set default true;
alter table ticket_stages alter column sell_vvip set not null;
alter table ticket_stages alter column sell_vip set not null;
alter table ticket_stages alter column sell_festival set not null;
