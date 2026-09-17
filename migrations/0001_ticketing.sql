create table if not exists staff_users (
  id text primary key,
  username text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin', 'crew', 'agent')),
  referral_code text unique,
  created_at timestamptz not null default now()
);

create table if not exists staff_sessions (
  token text primary key,
  staff_id text not null references staff_users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists staff_sessions_staff_id_idx on staff_sessions (staff_id);

create table if not exists orders (
  id serial primary key,
  public_id text not null unique,
  email text not null,
  full_name text not null,
  address text not null,
  whatsapp text not null,
  referral_code text,
  qty_vvip int not null default 0,
  qty_vip int not null default 0,
  qty_festival int not null default 0,
  base_amount int not null,
  unique_code int not null,
  total_amount int not null,
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment', 'awaiting_confirm', 'confirmed')),
  proof_data text,
  proof_mime text,
  proof_name text,
  confirmed_at timestamptz,
  confirmed_by text,
  created_at timestamptz not null default now()
);
create index if not exists orders_email_idx on orders (email);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_referral_idx on orders (referral_code);
create index if not exists orders_created_idx on orders (created_at desc);

create table if not exists tickets (
  id serial primary key,
  order_id int not null references orders(id) on delete cascade,
  ticket_type text not null check (ticket_type in ('vvip', 'vip', 'festival')),
  code text not null unique,
  created_at timestamptz not null default now()
);
create index if not exists tickets_order_id_idx on tickets (order_id);
