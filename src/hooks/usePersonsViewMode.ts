'use client';

import { type CatalogViewMode, useCatalogViewMode } from '@/hooks/useCatalogViewMode';

export type PersonsViewMode = CatalogViewMode;

export function usePersonsViewMode() {
  return useCatalogViewMode();
}
