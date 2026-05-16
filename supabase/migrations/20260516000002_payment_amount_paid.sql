-- Store actual amount entered per installment; track maturity payout adjustment on chit.
alter table payments
  add column if not exists amount_paid numeric(12, 2) default 0;

update payments
set amount_paid = coalesce(advance_amount_paid, 0)
where coalesce(amount_paid, 0) = 0
  and coalesce(advance_amount_paid, 0) > 0;

alter table chits
  add column if not exists collection_variance numeric(12, 2),
  add column if not exists withdrawal_net_amount numeric(12, 2);
