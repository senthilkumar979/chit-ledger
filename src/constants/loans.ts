export const LoanStatuses = {
  ACTIVE: 'active',
  CLOSED: 'closed',
} as const;

export type LoanStatus = (typeof LoanStatuses)[keyof typeof LoanStatuses];

/** Default simple interest: 1% of principal per month held until repayment. */
export const DEFAULT_LOAN_INTEREST_RATE = 0.01;

export const loanStatusLabels: Record<LoanStatus, string> = {
  active: 'Active',
  closed: 'Closed',
};
