'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardHeader } from '@/components/ui/Card';

const COLORS = ['#16A34A', '#2563EB', '#64748B', '#DC2626', '#D97706', '#0F172A'];

interface DistributionPieChartProps {
  title: string;
  description?: string;
  data: { name: string; amount: number }[];
  valueLabel?: string;
}

export function DistributionPieChart({
  title,
  description,
  data,
  valueLabel = 'Count',
}: DistributionPieChartProps) {
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
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={data[index].name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}`, valueLabel]} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
