-- Allow FIFTY_THOUSAND chit type (₹50K — half of ONE_LAKH schedule)

alter table chits drop constraint if exists chits_type_check;

alter table chits add constraint chits_type_check
  check (type in ('FIFTY_THOUSAND', 'ONE_LAKH', 'TWO_LAKH'));

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
  elsif new.type = 'TWO_LAKH' then
    schedule := '{
      "payments":[5000,4267.5,4310,4352.5,4395,4437.5,4480,4522.5,4565,4607.5,4647.5,4687.5,4727.5,4767.5,4807.5,4847.5,4887.5,4925,4962.5,3950],
      "maturity":[81500,82350,83200,84050,84900,85750,86600,87450,88300,89150,89950,90750,91550,92350,93150,93950,94750,95500,96250,97000]
    }'::jsonb;
  else
    schedule := '{
      "payments":[2500,2000,2030,2060,2090,2120,2150,2180,2210,2240,2270,2300,2325,2350,2375,2400,2425,2450,2475,1500],
      "maturity":[36900,37500,38100,38700,39300,39900,40500,41100,41700,42300,42900,43500,44000,44500,45000,45500,46000,46500,47000,47500]
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
