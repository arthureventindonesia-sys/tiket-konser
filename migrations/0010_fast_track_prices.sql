alter table ticket_stages add column if not exists ft_price_vvip int;
alter table ticket_stages add column if not exists ft_price_vip int;
alter table ticket_stages add column if not exists ft_price_festival int;

update ticket_stages set ft_price_vvip = price_vvip where ft_price_vvip is null;
update ticket_stages set ft_price_vip = price_vip where ft_price_vip is null;
update ticket_stages set ft_price_festival = price_festival where ft_price_festival is null;

alter table ticket_stages alter column ft_price_vvip set default 0;
alter table ticket_stages alter column ft_price_vip set default 0;
alter table ticket_stages alter column ft_price_festival set default 0;
alter table ticket_stages alter column ft_price_vvip set not null;
alter table ticket_stages alter column ft_price_vip set not null;
alter table ticket_stages alter column ft_price_festival set not null;
