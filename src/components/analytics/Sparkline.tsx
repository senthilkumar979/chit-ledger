'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data: number[];
  positive?: boolean;
  className?: string;
}

export function Sparkline({ data, positive = true, className }: SparklineProps) {
  const points = data.map((value, i) => ({ i, value }));
  const color = positive ? '#16A34A' : '#DC2626';

  return (
    <div className={cn('h-10 w-24', className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
