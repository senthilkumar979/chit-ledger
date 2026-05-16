import type { UserRole } from '@/constants/roles';
import type { ChitType } from '@/constants/chit-config';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Chit {
  id: string;
  person_id: string;
  type: ChitType;
  category: string;
  start_date: string | null;
  end_date: string | null;
  matured: boolean;
  withdrawal: boolean;
  withdrawal_date: string | null;
  withdrawal_by: string | null;
  withdrawal_payment_mode: string | null;
  withdrawal_proof_url: string | null;
  collection_variance: number | null;
  withdrawal_net_amount: number | null;
  created_at: string;
  updated_at: string;
  person?: Person;
  payments?: Pick<Payment, 'status'>[];
}

export interface Payment {
  id: string;
  chit_id: string;
  installment_no: number;
  expected_amount: number;
  maturity_amount: number;
  paid_date: string | null;
  payment_mode: string | null;
  paid_to: string | null;
  advance_amount_paid: number | null;
  amount_paid: number | null;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue';

export type LoanStatus = 'active' | 'closed';

export interface Loan {
  id: string;
  principal: number;
  interest_rate: number;
  interest_amount: number | null;
  repayment_amount: number | null;
  status: LoanStatus;
  start_date: string;
  closed_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  repayment_date: string;
  principal_paid: number;
  interest_paid: number;
  is_final: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface LoanWithRepayments extends Loan {
  repayments: LoanRepayment[];
}

export interface ChitWithPayments extends Chit {
  payments: Payment[];
}
