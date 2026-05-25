update payments
set
  advance_amount_paid = expected_amount,
  amount_paid = expected_amount
where status = 'paid'
  and expected_amount > 5000;
