'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { ChartDatum } from '@/services/analytics';

interface BreakdownBarChartProps {
  title: string;
  description?: string;
  data: ChartDatum[];
  color?: string;
}

export function BreakdownBarChart({
  title,
  description,
  data,
  color = '#16A34A',
}: BreakdownBarChartProps) {
  if (!data.length) {
    return (
      <Card padding="lg">
        <CardHeader title={title} description={description} />
        <p className="py-8 text-center text-sm text-muted">No data yet</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader title={title} description={description} />
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11 }}
              stroke="#64748B"
              tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 11 }}
              stroke="#64748B"
            />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Bar dataKey="amount" fill={color} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
