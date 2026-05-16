-- Safe when run alone in SQL editor (earlier migrations may not have been applied).
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create type loan_status as enum ('active', 'closed');

create table loans (
  id uuid primary key default gen_random_uuid(),
  principal numeric(14, 2) not null check (principal > 0),
  interest_rate numeric(8, 6) not null default 0.01 check (interest_rate >= 0),
  interest_amount numeric(14, 2) check (interest_amount is null or interest_amount >= 0),
  repayment_amount numeric(14, 2) check (repayment_amount is null or repayment_amount >= 0),
  status loan_status not null default 'active',
  start_date date not null,
  closed_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loans_closed_fields check (
    (status = 'active' and closed_date is null and interest_amount is null and repayment_amount is null)
    or (
      status = 'closed'
      and closed_date is not null
      and interest_amount is not null
      and repayment_amount is not null
    )
  )
);

create index idx_loans_status on loans(status);
create index idx_loans_start_date on loans(start_date);
create index idx_loans_closed_date on loans(closed_date);

create trigger loans_updated_at
  before update on loans
  for each row execute function handle_updated_at();

alter table loans enable row level security;

create policy "Authenticated read loans" on loans
  for select to authenticated using (true);

create policy "Admin insert loans" on loans
  for insert to authenticated with check (is_admin());

create policy "Admin update loans" on loans
  for update to authenticated using (is_admin());

create policy "Admin delete loans" on loans
  for delete to authenticated using (is_admin());
