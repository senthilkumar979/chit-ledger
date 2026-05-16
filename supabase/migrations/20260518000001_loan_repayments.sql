create table loan_repayments (
  id uuid primary key default gen_random_uuid(),
  loan_id uuid not null references loans(id) on delete cascade,
  repayment_date date not null,
  principal_paid numeric(14, 2) not null default 0 check (principal_paid >= 0),
  interest_paid numeric(14, 2) not null default 0 check (interest_paid >= 0),
  is_final boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint loan_repayments_amount check (principal_paid + interest_paid > 0)
);

create index idx_loan_repayments_loan on loan_repayments(loan_id);
create index idx_loan_repayments_date on loan_repayments(repayment_date);

create trigger loan_repayments_updated_at
  before update on loan_repayments
  for each row execute function handle_updated_at();

alter table loan_repayments enable row level security;

create policy "Authenticated read loan_repayments" on loan_repayments
  for select to authenticated using (true);

create policy "Admin insert loan_repayments" on loan_repayments
  for insert to authenticated with check (is_admin());

create policy "Admin update loan_repayments" on loan_repayments
  for update to authenticated using (is_admin());

create policy "Admin delete loan_repayments" on loan_repayments
  for delete to authenticated using (is_admin());
