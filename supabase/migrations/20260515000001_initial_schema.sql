-- Profiles (roles stored here, not user_metadata)
create type user_role as enum ('ADMIN', 'STAFF', 'VIEWER');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'VIEWER',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table persons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  phone text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chits (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references persons(id) on delete restrict,
  type text not null check (type in ('ONE_LAKH', 'TWO_LAKH')),
  category text not null,
  start_date date,
  end_date date,
  matured boolean default false,
  withdrawal boolean default false,
  withdrawal_date date,
  withdrawal_by text,
  withdrawal_payment_mode text,
  withdrawal_proof_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  chit_id uuid not null references chits(id) on delete cascade,
  installment_no integer not null check (installment_no between 1 and 20),
  expected_amount numeric(12,2) not null,
  maturity_amount numeric(12,2) not null,
  paid_date date,
  payment_mode text,
  paid_to text,
  advance_amount_paid numeric(12,2) default 0,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'partial', 'overdue')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (chit_id, installment_no)
);

create index idx_chits_person on chits(person_id);
create index idx_payments_chit on payments(chit_id);
create index idx_payments_status on payments(status);

alter table profiles enable row level security;
alter table persons enable row level security;
alter table chits enable row level security;
alter table payments enable row level security;

create or replace function public.get_user_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.can_write()
returns boolean
language sql stable security definer set search_path = public
as $$
  select get_user_role() in ('ADMIN', 'STAFF');
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select get_user_role() = 'ADMIN';
$$;

-- Profiles policies
create policy "Users read own profile" on profiles for select using (auth.uid() = id);
create policy "Admins manage profiles" on profiles for all using (is_admin());

-- Persons policies
create policy "Authenticated read persons" on persons for select to authenticated using (true);
create policy "Staff write persons" on persons for insert to authenticated with check (can_write());
create policy "Staff update persons" on persons for update to authenticated using (can_write());
create policy "Admin delete persons" on persons for delete to authenticated using (is_admin());

-- Chits policies
create policy "Authenticated read chits" on chits for select to authenticated using (true);
create policy "Staff write chits" on chits for insert to authenticated with check (can_write());
create policy "Staff update chits" on chits for update to authenticated using (can_write());
create policy "Admin delete chits" on chits for delete to authenticated using (is_admin());

-- Payments policies
create policy "Authenticated read payments" on payments for select to authenticated using (true);
create policy "Staff write payments" on payments for insert to authenticated with check (can_write());
create policy "Staff update payments" on payments for update to authenticated using (can_write());
create policy "Admin delete payments" on payments for delete to authenticated using (is_admin());
