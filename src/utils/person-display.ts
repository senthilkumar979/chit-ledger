interface PersonNameLike {
  name?: string | null;
  name_tamil?: string | null;
  city?: string | null;
}

function normalize(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getPrimaryPersonName(
  person?: PersonNameLike | null,
  fallback = 'Unknown',
): string {
  return normalize(person?.name_tamil) ?? normalize(person?.name) ?? fallback;
}

export function getSecondaryPersonName(person?: PersonNameLike | null): string | null {
  const primary = normalize(person?.name_tamil);
  const english = normalize(person?.name);
  if (!primary || !english || primary === english) return null;
  return english;
}

export function getDisplayPersonLabel(
  person?: PersonNameLike | null,
  fallback = 'Unknown',
): string {
  const primary = getPrimaryPersonName(person, fallback);
  const secondary = getSecondaryPersonName(person);
  return secondary ? `${primary} (${secondary})` : primary;
}

export function matchesPersonNameQuery(
  person: PersonNameLike | null | undefined,
  query: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  return [person?.name_tamil, person?.name]
    .map((value) => value?.toLowerCase())
    .some((value) => value?.includes(q));
}

export function getPersonOptionLabel(person?: PersonNameLike | null): string {
  const label = getDisplayPersonLabel(person, 'Member');
  return person?.city ? `${label} · ${person.city}` : label;
}
