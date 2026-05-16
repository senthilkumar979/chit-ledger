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
import type { VarianceMonthDatum } from '@/utils/dashboard-metrics';

interface VarianceTrendChartProps {
  data: VarianceMonthDatum[];
}

export function VarianceTrendChart({ data }: VarianceTrendChartProps) {
  if (!data.length) {
    return (
      <Card padding="lg">
        <CardHeader title="Extra vs shortfall" description="Payment variance by month" />
        <p className="py-8 text-center text-sm text-muted">No variance data yet</p>
      </Card>
    );
  }

  return (
    <Card padding="lg">
      <CardHeader
        title="Extra vs shortfall"
        description="Over/under payment vs expected across recorded installments"
      />
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748B" />
            <YAxis
              tick={{ fontSize: 11 }}
              stroke="#64748B"
              tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Legend />
            <Bar dataKey="extra" name="Extra" fill="#16A34A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="shortfall" name="Shortfall" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
