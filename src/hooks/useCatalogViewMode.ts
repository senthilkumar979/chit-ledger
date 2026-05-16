'use client';

import { useEffect, useState } from 'react';

export type CatalogViewMode = 'grid' | 'list' | 'table';

const DESKTOP_QUERY = '(min-width: 768px)';

function defaultViewForViewport(): CatalogViewMode {
  if (typeof window === 'undefined') return 'grid';
  return window.matchMedia(DESKTOP_QUERY).matches ? 'table' : 'grid';
}

export function useCatalogViewMode() {
  const [view, setView] = useState<CatalogViewMode>('grid');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setView(defaultViewForViewport());
    setIsReady(true);
  }, []);

  return { view, setView, isReady };
}
