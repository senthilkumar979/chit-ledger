export const PaidToRecipients = {
  OFFICE: 'Office',
  FIELD_AGENT: 'Field agent',
  BANK: 'Bank deposit',
} as const;

export const paidToRecipientOptions = Object.values(PaidToRecipients).map((value) => ({
  value,
  label: value,
}));
