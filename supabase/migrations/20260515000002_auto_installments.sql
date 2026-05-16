create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger persons_updated_at before update on persons
  for each row execute function handle_updated_at();
create trigger chits_updated_at before update on chits
  for each row execute function handle_updated_at();
create trigger payments_updated_at before update on payments
  for each row execute function handle_updated_at();
create trigger profiles_updated_at before update on profiles
  for each row execute function handle_updated_at();

create or replace function public.create_installments_for_chit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  schedule jsonb;
  i int;
begin
  if new.type = 'ONE_LAKH' then
    schedule := '{
      "payments":[5000,4000,4060,4120,4180,4240,4300,4360,4420,4480,4540,4600,4650,4700,4750,4800,4850,4900,4950,3000],
      "maturity":[73800,75000,76200,77400,78600,79800,81000,82200,83400,84600,85800,87000,88000,89000,90000,91000,92000,93000,94000,95000]
    }'::jsonb;
  else
    schedule := '{
      "payments":[5000,4267.5,4310,4352.5,4395,4437.5,4480,4522.5,4565,4607.5,4647.5,4687.5,4727.5,4767.5,4807.5,4847.5,4887.5,4925,4962.5,3950],
      "maturity":[81500,82350,83200,84050,84900,85750,86600,87450,88300,89150,89950,90750,91550,92350,93150,93950,94750,95500,96250,97000]
    }'::jsonb;
  end if;

  for i in 1..20 loop
    insert into payments (chit_id, installment_no, expected_amount, maturity_amount, status)
    values (
      new.id,
      i,
      (schedule->'payments'->>(i-1))::numeric,
      (schedule->'maturity'->>(i-1))::numeric,
      'pending'
    );
  end loop;

  return new;
end;
$$;

create trigger on_chit_created after insert on chits
  for each row execute function create_installments_for_chit();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_app_meta_data->>'role')::user_role, 'VIEWER')
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
