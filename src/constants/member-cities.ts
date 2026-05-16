/** Cities available when creating or editing a member. */
export const MemberCities = [
  'Natham',
  'Dindigul',
  'Ponnamaravathy',
  'Coimbatore',
  'Madurai',
  'Sivakasi',
] as const;

export type MemberCity = (typeof MemberCities)[number];
