'use client';

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { CashFlowMonth } from '@/utils/enterprise-metrics';

interface CashFlowComboChartProps {
  data: CashFlowMonth[];
  activeMonthKey?: string;
  onMonthSelect?: (monthKey: string) => void;
}

export function CashFlowComboChart({ data, activeMonthKey, onMonthSelect }: CashFlowComboChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={data}
        onClick={(state) => {
          const payload = state as { activePayload?: { payload?: CashFlowMonth }[] } | null;
          const key = payload?.activePayload?.[0]?.payload?.monthKey;
          if (key) onMonthSelect?.(key);
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `₹${(Number(v) / 100000).toFixed(1)}L`} tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v) => formatCurrency(Number(v))} />
        <Legend />
        <Bar dataKey="collections" name="Collections" fill="#0F172A" radius={[4, 4, 0, 0]} />
        <Line type="monotone" dataKey="loanRepayments" name="Loan repayments" stroke="#DC2626" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="withdrawals" name="Withdrawals" stroke="#2563EB" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
