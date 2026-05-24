create table public.grants (
  id uuid primary key default gen_random_uuid(),
  grant_to_person_id uuid not null references public.persons(id) on delete restrict,
  amount numeric(14, 2) not null check (amount > 0),
  interest_start_date date not null,
  interest_rate numeric(8, 6) not null default 0.01 check (interest_rate >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_grants_grant_to_person_id on public.grants(grant_to_person_id);
create index idx_grants_interest_start_date on public.grants(interest_start_date);

create trigger grants_updated_at
  before update on public.grants
  for each row execute function public.handle_updated_at();

alter table public.grants enable row level security;

create policy "Authenticated read grants" on public.grants
  for select to authenticated using (true);

create policy "Admin insert grants" on public.grants
  for insert to authenticated with check (is_admin());

create policy "Admin update grants" on public.grants
  for update to authenticated using (is_admin());

create policy "Admin delete grants" on public.grants
  for delete to authenticated using (is_admin());
