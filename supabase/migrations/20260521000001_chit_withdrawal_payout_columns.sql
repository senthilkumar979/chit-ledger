-- Persist net payout and collection variance when recording withdrawal
alter table public.chits
  add column if not exists collection_variance numeric(12, 2),
  add column if not exists withdrawal_net_amount numeric(12, 2);
