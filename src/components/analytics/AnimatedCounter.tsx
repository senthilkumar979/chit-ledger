'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  isCurrency?: boolean;
  className?: string;
}

export function AnimatedCounter({ value, isCurrency, className }: AnimatedCounterProps) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = display;
    const diff = value - start;
    if (diff === 0) return;
    const steps = 12;
    let step = 0;
    const id = window.setInterval(() => {
      step++;
      setDisplay(start + (diff * step) / steps);
      if (step >= steps) {
        setDisplay(value);
        window.clearInterval(id);
      }
    }, 24);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const text = isCurrency ? formatCurrency(display) : Math.round(display).toLocaleString('en-IN');
  return <span className={className}>{text}</span>;
}
