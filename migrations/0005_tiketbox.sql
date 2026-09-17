alter table staff_users drop constraint if exists staff_users_role_check;
alter table staff_users add constraint staff_users_role_check
  check (role in ('admin', 'crew', 'agent', 'tiketbox'));

alter table orders add column if not exists taken_at timestamptz;
alter table orders add column if not exists taken_by text;
