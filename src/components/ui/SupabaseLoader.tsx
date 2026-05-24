'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BRAND } from '@/constants/brand';

interface SupabaseLoaderProps {
  variant?: 'inline' | 'overlay' | 'fullscreen';
  label?: string;
  className?: string;
}

export function SupabaseLoader({
  variant = 'inline',
  label = 'Loading…',
  className,
}: SupabaseLoaderProps) {
  const spinner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-lg ring-2 ring-accent/30">
          <Image
            src={BRAND.logoSrc}
            alt=""
            width={64}
            height={64}
            className="h-full w-full object-cover animate-pulse"
            aria-hidden
          />
        </div>
      </div>
      <p className="text-sm font-medium text-primary">{label}</p>
    </div>
  );

  if (variant === 'inline') return spinner;

  const isFullscreen = variant === 'fullscreen';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex items-center justify-center',
        isFullscreen ? 'fixed inset-0 z-[200]' : 'fixed inset-0 z-[100] lg:left-64',
        'bg-background/55 backdrop-blur-[2px]',
      )}
    >
      <div className="rounded-2xl border border-border/80 bg-card/95 px-8 py-7 shadow-xl">
        {spinner}
      </div>
    </div>
  );
}
