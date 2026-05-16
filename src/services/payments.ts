import { createClient } from '@/lib/supabase/client';
import type { Payment } from '@/types/database';
import type { MarkPaymentFormData } from '@/schemas/payment';
import { computePaymentStatus } from '@/utils/payment-status';

export async function fetchPayments(filters?: {
  status?: string;
  search?: string;
}): Promise<Payment[]> {
  const supabase = createClient();
  let query = supabase
    .from('payments')
    .select('*, chit:chits(id, type, category, start_date, person:persons(name, city))')
    .order('installment_no');

  if (filters?.status) query = query.eq('status', filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let results = (data ?? []) as Payment[];
  if (filters?.search?.trim()) {
    const q = filters.search.toLowerCase();
    results = results.filter((p) => {
      const chit = p as Payment & { chit?: { person?: { name?: string } } };
      return chit.chit?.person?.name?.toLowerCase().includes(q);
    });
  }
  return results;
}

export async function markPayment(
  paymentId: string,
  expected: number,
  input: MarkPaymentFormData,
): Promise<Payment> {
  const supabase = createClient();
  const advance = input.is_advance
    ? input.amount_paid
    : Math.min(input.amount_paid, expected);
  const status = computePaymentStatus(expected, input.amount_paid);

  const { data, error } = await supabase
    .from('payments')
    .update({
      paid_date: input.paid_date,
      payment_mode: input.payment_mode,
      paid_to: input.paid_to,
      advance_amount_paid: advance,
      status,
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const payment = data as Payment;

  if (payment.installment_no === 20 && payment.chit_id) {
    const matured = payment.status === 'paid';
    const { error: chitErr } = await supabase
      .from('chits')
      .update({ matured })
      .eq('id', payment.chit_id);
    if (chitErr) throw new Error(chitErr.message);
  }

  return payment;
}

export async function updatePayment(
  paymentId: string,
  expected: number,
  input: MarkPaymentFormData,
): Promise<Payment> {
  return markPayment(paymentId, expected, input);
}

export async function resetPayment(paymentId: string): Promise<Payment> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('payments')
    .update({
      paid_date: null,
      payment_mode: null,
      paid_to: null,
      advance_amount_paid: 0,
      status: 'pending',
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const payment = data as Payment;

  if (payment.installment_no === 20 && payment.chit_id) {
    const { error: chitErr } = await supabase
      .from('chits')
      .update({ matured: false })
      .eq('id', payment.chit_id);
    if (chitErr) throw new Error(chitErr.message);
  }

  return payment;
}

export async function markOverduePayments(): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('payments')
    .update({ status: 'overdue' })
    .eq('status', 'pending')
    .lt('created_at', today);
}
