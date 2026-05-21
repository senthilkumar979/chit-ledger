export const PaidToRecipients = {
  SEKAR: 'Sekar',
  AKILA: 'Akila',
  JEEVA: 'Jeeva',
  RAMASAMY: 'Ramasamy',
} as const;

export const paidToRecipientOptions = Object.values(PaidToRecipients).map((value) => ({
  value,
  label: value,
}));
