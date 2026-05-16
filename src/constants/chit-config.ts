export const ChitTypes = {
  ONE_LAKH: 'ONE_LAKH',
  TWO_LAKH: 'TWO_LAKH',
} as const;

export type ChitType = (typeof ChitTypes)[keyof typeof ChitTypes];

export const INSTALLMENT_COUNT = 20;

export const ONE_LAKH = {
  payments: [
    5000, 4000, 4060, 4120, 4180, 4240, 4300, 4360, 4420, 4480,
    4540, 4600, 4650, 4700, 4750, 4800, 4850, 4900, 4950, 3000,
  ],
  maturity: [
    73800, 75000, 76200, 77400, 78600, 79800, 81000, 82200, 83400,
    84600, 85800, 87000, 88000, 89000, 90000, 91000, 92000, 93000,
    94000, 95000,
  ],
} as const;

export const TWO_LAKH = {
  payments: [
    5000, 4267.5, 4310, 4352.5, 4395, 4437.5, 4480, 4522.5, 4565,
    4607.5, 4647.5, 4687.5, 4727.5, 4767.5, 4807.5, 4847.5, 4887.5,
    4925, 4962.5, 3950,
  ],
  maturity: [
    81500, 82350, 83200, 84050, 84900, 85750, 86600, 87450, 88300,
    89150, 89950, 90750, 91550, 92350, 93150, 93950, 94750, 95500,
    96250, 97000,
  ],
} as const;

export function getChitSchedule(type: ChitType) {
  return type === ChitTypes.ONE_LAKH ? ONE_LAKH : TWO_LAKH;
}
