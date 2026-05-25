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
      "payments":[10000,8535,8620,8705,8790,8875,8960,9045,9130,9215,9295,9375,9455,9535,9615,9695,9775,9850,9925,7900],
      "maturity":[163000,164700,166400,168100,169800,171500,173200,174900,176600,178300,179900,181500,183100,184700,186300,187900,189500,191000,192500,194000]
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
