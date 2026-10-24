alter table ticket_stages add column if not exists purchase_limit int;

update ticket_stages
set purchase_limit = case when id = 'early_bird' then 1 else 4 end
where purchase_limit is null;

alter table ticket_stages alter column purchase_limit set default 4;
alter table ticket_stages alter column purchase_limit set not null;
