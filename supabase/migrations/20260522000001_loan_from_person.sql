-- Link each loan to the member it was borrowed from

alter table public.loans
  add column if not exists loan_from_person_id uuid references public.persons(id) on delete restrict;

create index if not exists idx_loans_loan_from_person_id
  on public.loans(loan_from_person_id);
