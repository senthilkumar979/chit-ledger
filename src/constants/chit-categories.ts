/** Monthly collection schedule options stored as `chits.category`. */
export const ChitCategories = ['5th of every month', '20th of every month'] as const;

export type ChitCategory = (typeof ChitCategories)[number];
