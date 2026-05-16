'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface WaterfallChartProps {
  data: { name: string; value: number }[];
}

export function WaterfallChart({ data }: WaterfallChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(1)}L`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={entry.name} fill={entry.value >= 0 ? (i === data.length - 1 ? '#16A34A' : '#0F172A') : '#DC2626'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
