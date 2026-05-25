/** Cities available when creating or editing a member. */
export const MemberCities = [
  'நத்தம்',
  'திண்டுக்கல்',
  'பொன்னமராவதி',
  'கோயம்புத்தூர்',
  'மதுரை',
  'சிவகாசி',
  'திருச்சி',
] as const;

export const MemberCitiesInEnglish = {
  'நத்தம்': 'Natham',
  'திண்டுக்கல்': 'Dindigul',
  'பொன்னமராவதி': 'Ponnamaravathy',
  'கோயம்புத்தூர்': 'Coimbatore',
  'மதுரை': 'Madurai',
  'சிவகாசி': 'Sivakasi',
  'திருச்சி': 'Trichy',
} as const;

export function getMemberCityInEnglish(city?: string | null): string {
  if (!city) return '';
  return MemberCitiesInEnglish[city as keyof typeof MemberCitiesInEnglish] ?? city;
}

export type MemberCity = (typeof MemberCities)[number];
