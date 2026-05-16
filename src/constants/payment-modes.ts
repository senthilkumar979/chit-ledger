export const PaymentModes = {
  CASH: 'Cash',
  UPI: 'UPI',
  BANK: 'Bank Transfer',
  CHEQUE: 'Cheque',
} as const;

export type PaymentMode = (typeof PaymentModes)[keyof typeof PaymentModes];

export const paymentModeOptions = Object.values(PaymentModes).map((v) => ({
  value: v,
  label: v,
}));
