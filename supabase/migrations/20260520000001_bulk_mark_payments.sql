-- Mark multiple consecutive unpaid installments in one transaction

create or replace function public.mark_bulk_chit_payments(
  p_chit_id uuid,
  p_count int,
  p_paid_date date,
  p_payment_mode text,
  p_paid_to text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
  v_includes_20 boolean;
begin
  if not public.can_write() then
    raise exception 'Not authorized to record payments';
  end if;

  if p_count < 1 or p_count > 20 then
    raise exception 'Installment count must be between 1 and 20';
  end if;

  with target as (
    select id, expected_amount, installment_no
    from payments
    where chit_id = p_chit_id
      and status <> 'paid'
    order by installment_no
    limit p_count
  ),
  updated as (
    update payments p
    set
      paid_date = p_paid_date,
      payment_mode = p_payment_mode,
      paid_to = p_paid_to,
      amount_paid = t.expected_amount,
      advance_amount_paid = t.expected_amount,
      status = 'paid',
      updated_at = now()
    from target t
    where p.id = t.id
    returning p.installment_no
  )
  select count(*)::int, coalesce(bool_or(installment_no = 20), false)
  into v_updated, v_includes_20
  from updated;

  if v_updated = 0 then
    raise exception 'No unpaid installments to record';
  end if;

  if v_includes_20 then
    update chits set matured = true where id = p_chit_id;
  end if;

  return jsonb_build_object('updated_count', v_updated);
end;
$$;

grant execute on function public.mark_bulk_chit_payments(uuid, int, date, text, text)
  to authenticated;
