import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import type { Payment } from '@/types/database';
import type { BulkMarkPaymentFormData, MarkPaymentFormData } from '@/schemas/payment';
import { computePaymentStatus } from '@/utils/payment-status';
import {
  buildMonthlyScheduledPayments,
  type ChitWithSchedulePayments,
  type MonthlyScheduledPaymentsResult,
  type PaymentWithChit,
} from '@/utils/payment-month';

const PAYMENT_CHIT_SELECT =
  '*, chit:chits(id, type, category, start_date, end_date, matured, withdrawal, person:persons(name, city))';

const CHITS_WITH_PAYMENTS_SELECT = `
  id,
  type,
  category,
  start_date,
  end_date,
  matured,
  withdrawal,
  person:persons(name, city),
  payments(
    id,
    chit_id,
    installment_no,
    expected_amount,
    maturity_amount,
    paid_date,
    payment_mode,
    paid_to,
    advance_amount_paid,
    amount_paid,
    status,
    created_at,
    updated_at
  )
`;

export interface PaymentsPageData {
  chits: ChitWithSchedulePayments[];
}

async function queryChitsWithPaymentsSchedule(): Promise<ChitWithSchedulePayments[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('chits')
    .select(CHITS_WITH_PAYMENTS_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);

  const chits = (data ?? []) as ChitWithSchedulePayments[];
  for (const chit of chits) {
    chit.payments?.sort((a, b) => a.installment_no - b.installment_no);
  }
  return chits;
}

export async function fetchPaymentsPageData(): Promise<PaymentsPageData> {
  return supabaseRequest(async () => ({
    chits: await queryChitsWithPaymentsSchedule(),
  }));
}

export async function fetchChitsWithPaymentsSchedule(): Promise<ChitWithSchedulePayments[]> {
  return supabaseRequest(queryChitsWithPaymentsSchedule);
}

export async function fetchScheduledPaymentsForMonth(
  monthKey: string,
): Promise<MonthlyScheduledPaymentsResult> {
  return supabaseRequest(async () => {
    const chits = await queryChitsWithPaymentsSchedule();
    return buildMonthlyScheduledPayments(chits, monthKey);
  });
}

export async function fetchPayments(filters?: {
  status?: string;
  search?: string;
}): Promise<Payment[]> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    let query = supabase.from('payments').select(PAYMENT_CHIT_SELECT).order('installment_no');

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
  });
}

export async function markPayment(
  paymentId: string,
  expected: number,
  input: MarkPaymentFormData,
): Promise<Payment> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const amountPaid = input.amount_paid;
    const status = computePaymentStatus(expected, amountPaid);

    const { data, error } = await supabase
      .from('payments')
      .update({
        paid_date: input.paid_date,
        payment_mode: input.payment_mode,
        paid_to: input.paid_to,
        amount_paid: amountPaid,
        advance_amount_paid: amountPaid,
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
  });
}

export async function markBulkPayments(
  chitId: string,
  input: BulkMarkPaymentFormData,
): Promise<{ updatedCount: number }> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc('mark_bulk_chit_payments', {
      p_chit_id: chitId,
      p_count: input.installment_count,
      p_paid_date: input.paid_date,
      p_payment_mode: input.payment_mode,
      p_paid_to: input.paid_to,
    });

    if (error) throw new Error(error.message);

    const payload = data as { updated_count?: number } | null;
    return { updatedCount: payload?.updated_count ?? input.installment_count };
  });
}

export async function updatePayment(
  paymentId: string,
  expected: number,
  input: MarkPaymentFormData,
): Promise<Payment> {
  return markPayment(paymentId, expected, input);
}

export async function resetPayment(paymentId: string): Promise<Payment> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payments')
      .update({
        paid_date: null,
        payment_mode: null,
        paid_to: null,
        amount_paid: 0,
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
  });
}

export async function markOverduePayments(): Promise<void> {
  return supabaseRequest(async () => {
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('payments')
      .update({ status: 'overdue' })
      .eq('status', 'pending')
      .lt('created_at', today);
  });
}

export type { PaymentWithChit, MonthlyScheduledPaymentsResult, ChitWithSchedulePayments };
