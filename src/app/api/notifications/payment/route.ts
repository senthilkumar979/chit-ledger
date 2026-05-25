import { NextResponse } from 'next/server';
import { getProfile } from '@/lib/auth/get-profile';
import { sendCallMeBotMessage } from '@/lib/callmebot';
import { createClient } from '@/lib/supabase/server';
import { chitTypeLabels } from '@/constants/chit-labels';
import { getRecordedAmount } from '@/utils/chit-payment-summary';
import type { Payment } from '@/types/database';

const PAYMENT_NOTIFICATION_SELECT = `
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
  updated_at,
  chit:chits(
    type,
    category,
    person:persons(name, city)
  )
`;

const CHIT_NOTIFICATION_SELECT = `
  id,
  type,
  category,
  person:persons(name, city)
`;

interface PaymentNotificationRow extends Payment {
  chit?: {
    type?: string;
    category?: string;
    person?: { name?: string; city?: string };
  } | null;
}

interface ChitNotificationRow {
  id: string;
  type?: string;
  category?: string;
  person?: { name?: string; city?: string } | null;
}

interface SinglePaymentRequest {
  kind: 'single';
  paymentId: string;
}

interface BulkPaymentRequest {
  kind: 'bulk';
  chitId: string;
  installmentCount: number;
  paidDate: string;
  paymentMode: string;
  paidTo: string;
}

type PaymentNotificationRequest = SinglePaymentRequest | BulkPaymentRequest;

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function isSinglePaymentRequest(
  payload: PaymentNotificationRequest,
): payload is SinglePaymentRequest {
  return payload.kind === 'single';
}

function formatScheme(type?: string, category?: string): string {
  const typeLabel = type ? (chitTypeLabels[type] ?? type) : 'Unknown';
  return `${typeLabel} · ${category ?? 'Unknown'}`;
}

function buildSinglePaymentMessage(payment: PaymentNotificationRow): string {
  const memberName = payment.chit?.person?.name ?? 'Member';
  const city = payment.chit?.person?.city;
  const amount = getRecordedAmount(payment) || Number(payment.expected_amount);

  return [
    '*Payment Recorded*',
    '',
    `Member: ${memberName}${city ? ` (${city})` : ''}`,
    `Scheme: ${formatScheme(payment.chit?.type, payment.chit?.category)}`,
    `Installment: #${payment.installment_no}`,
    `Amount: Rs. ${formatAmount(amount)}`,
    `Date: ${payment.paid_date ?? '-'}`,
    `Mode: ${payment.payment_mode ?? '-'}`,
    `Paid to: ${payment.paid_to ?? '-'}`,
  ].join('\n');
}

function buildBulkPaymentMessage(
  chit: ChitNotificationRow,
  payload: BulkPaymentRequest,
): string {
  const memberName = chit.person?.name ?? 'Member';
  const city = chit.person?.city;

  return [
    '*Bulk Payment Recorded*',
    '',
    `Member: ${memberName}${city ? ` (${city})` : ''}`,
    `Scheme: ${formatScheme(chit.type, chit.category)}`,
    `Installments: ${payload.installmentCount}`,
    `Date: ${payload.paidDate}`,
    `Mode: ${payload.paymentMode}`,
    `Paid to: ${payload.paidTo}`,
  ].join('\n');
}

export async function POST(request: Request) {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: PaymentNotificationRequest;
  try {
    payload = (await request.json()) as PaymentNotificationRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    let message: string;

    if (isSinglePaymentRequest(payload)) {
      const { data, error } = await supabase
        .from('payments')
        .select(PAYMENT_NOTIFICATION_SELECT)
        .eq('id', payload.paymentId)
        .single();

      if (error) throw new Error(error.message);
      message = buildSinglePaymentMessage(data as PaymentNotificationRow);
    } else {
      const { data, error } = await supabase
        .from('chits')
        .select(CHIT_NOTIFICATION_SELECT)
        .eq('id', payload.chitId)
        .single();

      if (error) throw new Error(error.message);
      message = buildBulkPaymentMessage(data as ChitNotificationRow, payload);
    }

    const sent = await sendCallMeBotMessage(message);
    return NextResponse.json({ sent });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Notification failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
