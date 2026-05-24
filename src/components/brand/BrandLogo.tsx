import Image from 'next/image';
import { cn } from '@/lib/utils';
import { BRAND } from '@/constants/brand';

const sizeMap = {
  xs: { box: 'h-8 w-8', px: 32 },
  sm: { box: 'h-9 w-9', px: 36 },
  md: { box: 'h-12 w-12', px: 48 },
  lg: { box: 'h-14 w-14', px: 56 },
  xl: { box: 'h-20 w-20', px: 80 },
} as const;

interface BrandLogoProps {
  size?: keyof typeof sizeMap;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

export function BrandLogo({
  size = 'md',
  showWordmark = false,
  className,
  wordmarkClassName,
}: BrandLogoProps) {
  const { box, px } = sizeMap[size];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'relative shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border/60',
          box,
        )}
      >
        <Image
          src={BRAND.logoSrc}
          alt={BRAND.name}
          width={px}
          height={px}
          className="h-full w-full object-cover"
          priority={size === 'lg' || size === 'xl'}
        />
      </div>
      {showWordmark ? (
        <div className={cn('min-w-0', wordmarkClassName)}>
          <p className="truncate text-lg font-bold tracking-tight text-primary">{BRAND.name}</p>
          <p className="truncate text-xs text-muted">{BRAND.tagline}</p>
        </div>
      ) : null}
    </div>
  );
}
