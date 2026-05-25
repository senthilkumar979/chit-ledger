import { createClient } from '@/lib/supabase/client';
import { supabaseRequest } from '@/lib/supabase/request';
import { LoanStatuses } from '@/constants/loans';
import type { CloseLoanFormData, PartialRepaymentFormData, TakeLoanFormData } from '@/schemas/loan';
import { interestPeriodStart, summarizeLoanBalance } from '@/utils/loan-balance';
import {
  buildLoanPeriodInterestBreakdown,
  calculateRepaymentAmount,
  roundMoney,
} from '@/utils/loan-calculations';
import type { Loan, LoanRepayment, LoanWithRepayments } from '@/types/database';

function mapLoan(row: Loan): Loan {
  return {
    ...row,
    principal: Number(row.principal),
    interest_rate: Number(row.interest_rate),
    interest_amount: row.interest_amount != null ? Number(row.interest_amount) : null,
    repayment_amount: row.repayment_amount != null ? Number(row.repayment_amount) : null,
  };
}

function mapRepayment(row: LoanRepayment): LoanRepayment {
  return {
    ...row,
    principal_paid: Number(row.principal_paid),
    interest_paid: Number(row.interest_paid),
  };
}

export async function fetchLoans(): Promise<Loan[]> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('loans')
    .select('*, loan_from:persons(id, name, name_tamil, city)')
    .order('start_date', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapLoan(row as Loan));
  });
}

export async function fetchLoan(id: string): Promise<Loan> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('loans')
    .select('*, loan_from:persons(id, name, name_tamil, city)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return mapLoan(data as Loan);
  });
}

async function loadLoanWithRepayments(id: string): Promise<LoanWithRepayments> {
  const supabase = createClient();
  const [loanRes, repayRes] = await Promise.all([
    supabase
      .from('loans')
      .select('*, loan_from:persons(id, name, name_tamil, city)')
      .eq('id', id)
      .single(),
    supabase
      .from('loan_repayments')
      .select('*')
      .eq('loan_id', id)
      .order('repayment_date', { ascending: true }),
  ]);

  if (loanRes.error) throw new Error(loanRes.error.message);
  if (repayRes.error) throw new Error(repayRes.error.message);

  return {
    ...mapLoan(loanRes.data as Loan),
    repayments: (repayRes.data ?? []).map((row) => mapRepayment(row as LoanRepayment)),
  };
}

export async function fetchLoanWithRepayments(id: string): Promise<LoanWithRepayments> {
  return supabaseRequest(() => loadLoanWithRepayments(id));
}

export async function createLoan(form: TakeLoanFormData): Promise<Loan> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('loans')
    .insert({
      loan_from_person_id: form.loan_from_person_id,
      principal: form.principal,
      interest_rate: form.interest_rate,
      start_date: form.start_date,
      notes: form.notes?.trim() || null,
      status: LoanStatuses.ACTIVE,
    })
    .select('*, loan_from:persons(id, name, name_tamil, city)')
    .single();

  if (error) throw new Error(error.message);
  return mapLoan(data as Loan);
  });
}

export async function createPartialRepayment(
  loanId: string,
  form: PartialRepaymentFormData,
): Promise<LoanRepayment> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const bundle = await loadLoanWithRepayments(loanId);

  if (bundle.status !== LoanStatuses.ACTIVE) {
    throw new Error('Only active loans accept partial repayments');
  }

  const balance = summarizeLoanBalance(bundle, bundle.repayments);
  const principalPaid = roundMoney(form.principal_paid);
  const interestPaid = roundMoney(form.interest_paid);

  if (principalPaid > balance.principalOutstanding) {
    throw new Error(
      `Principal paid cannot exceed outstanding balance (${balance.principalOutstanding})`,
    );
  }

  if (principalPaid >= balance.principalOutstanding && interestPaid <= 0) {
    throw new Error('Use Close loan to repay the remaining principal in full');
  }

  const { data, error } = await supabase
    .from('loan_repayments')
    .insert({
      loan_id: loanId,
      repayment_date: form.repayment_date,
      principal_paid: principalPaid,
      interest_paid: interestPaid,
      is_final: false,
      notes: form.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRepayment(data as LoanRepayment);
  });
}

export async function closeLoan(loanId: string, form: CloseLoanFormData): Promise<Loan> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const bundle = await loadLoanWithRepayments(loanId);

  if (bundle.status !== LoanStatuses.ACTIVE) {
    throw new Error('Only active loans can be closed');
  }

  const balance = summarizeLoanBalance(bundle, bundle.repayments);
  const closingInterest = roundMoney(form.interest_amount);
  const closingPrincipal = balance.principalOutstanding;
  const expectedTotal = calculateRepaymentAmount(closingPrincipal, closingInterest);

  if (form.repayment_amount < expectedTotal - 0.01) {
    throw new Error(
      `Repayment must cover outstanding principal (${closingPrincipal}) plus closing interest`,
    );
  }

  const { error: repayError } = await supabase.from('loan_repayments').insert({
    loan_id: loanId,
    repayment_date: form.closed_date,
    principal_paid: closingPrincipal,
    interest_paid: closingInterest,
    is_final: true,
    notes: 'Final closure',
  });

  if (repayError) throw new Error(repayError.message);

  const totalInterest = roundMoney(balance.interestPaidToDate + closingInterest);
  const totalRepayment = roundMoney(
    balance.totalRepaidToDate + closingPrincipal + closingInterest,
  );

  const { data, error } = await supabase
    .from('loans')
    .update({
      status: LoanStatuses.CLOSED,
      closed_date: form.closed_date,
      interest_amount: totalInterest,
      repayment_amount: totalRepayment,
    })
    .eq('id', loanId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapLoan(data as Loan);
  });
}

export async function deleteLoan(id: string): Promise<void> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const { error } = await supabase.from('loans').delete().eq('id', id);
  if (error) throw new Error(error.message);
  });
}

export async function deleteLoanRepayment(loanId: string, repaymentId: string): Promise<Loan> {
  return supabaseRequest(async () => {
  const supabase = createClient();
  const bundle = await loadLoanWithRepayments(loanId);
  const target = bundle.repayments.find((r) => r.id === repaymentId);

  if (!target) {
    throw new Error('Repayment not found');
  }

  const { error: deleteError } = await supabase
    .from('loan_repayments')
    .delete()
    .eq('id', repaymentId)
    .eq('loan_id', loanId);

  if (deleteError) throw new Error(deleteError.message);

  const remaining = bundle.repayments.filter((r) => r.id !== repaymentId);
  const loanPatch = buildLoanStateAfterRepayments(bundle, remaining);

  const { data, error } = await supabase
    .from('loans')
    .update(loanPatch)
    .eq('id', loanId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapLoan(data as Loan);
  });
}

function buildLoanStateAfterRepayments(
  loan: Loan,
  repayments: LoanRepayment[],
): Record<string, unknown> {
  const finalRepayment = repayments.find((r) => r.is_final);

  if (!finalRepayment) {
    return {
      status: LoanStatuses.ACTIVE,
      closed_date: null,
      interest_amount: null,
      repayment_amount: null,
    };
  }

  const balance = summarizeLoanBalance(loan, repayments);
  return {
    status: LoanStatuses.CLOSED,
    closed_date: finalRepayment.repayment_date,
    interest_amount: balance.interestPaidToDate,
    repayment_amount: balance.totalRepaidToDate,
  };
}

export function getClosingBreakdown(bundle: LoanWithRepayments, closeDate: string) {
  const balance = summarizeLoanBalance(bundle, bundle.repayments);
  const periodStart = interestPeriodStart(bundle, bundle.repayments);
  const breakdown = buildLoanPeriodInterestBreakdown(
    balance.principalOutstanding,
    bundle.interest_rate,
    periodStart,
    closeDate,
  );

  return { balance, periodStart, breakdown };
}
