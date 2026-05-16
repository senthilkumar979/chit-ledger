'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface MonthComparisonChartProps {
  expected: number;
  collected: number;
  monthLabel: string;
}

export function MonthComparisonChart({
  expected,
  collected,
  monthLabel,
}: MonthComparisonChartProps) {
  const data = [
    { name: 'Expected', amount: expected },
    { name: 'Collected', amount: collected },
  ];

  return (
    <Card padding="lg">
      <CardHeader
        title="This month at a glance"
        description={`Expected vs actual collections recorded in ${monthLabel}`}
      />
      <div className="h-52 w-full sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#64748B"
              tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend />
            <Bar dataKey="amount" fill="#16A34A" radius={[6, 6, 0, 0]} name="Amount" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
