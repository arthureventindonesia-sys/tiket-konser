alter table tickets add column if not exists unit_price int;
alter table tickets add column if not exists upgrade_from text;
alter table tickets add column if not exists upgrade_paid int;
alter table tickets add column if not exists upgrade_stage text;
