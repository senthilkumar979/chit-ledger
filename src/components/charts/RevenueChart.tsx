'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: { name: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card padding="lg">
      <CardHeader title="Revenue trend" description="Monthly collections" />
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748B" />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#64748B"
              tickFormatter={(v) => `₹${(Number(v) / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v) => formatCurrency(Number(v))} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#16A34A"
              fill="url(#revenueGrad)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
