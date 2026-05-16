'use client';

import {
  Landmark,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { KpiCard } from '@/components/cards/KpiCard';

interface DashboardStatsProps {
  stats: {
    activeChits: number;
    pendingCollections: number;
    monthlyRevenue: number;
    maturedChits: number;
    overdueAccounts: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard title="Active Chits" value={stats.activeChits} icon={Landmark} />
      <KpiCard
        title="Pending Collections"
        value={stats.pendingCollections}
        icon={Clock}
        variant="warning"
        isCurrency
      />
      <KpiCard
        title="Monthly Revenue"
        value={stats.monthlyRevenue}
        icon={IndianRupee}
        variant="accent"
        isCurrency
        trend={12}
      />
      <KpiCard
        title="Matured Chits"
        value={stats.maturedChits}
        icon={CheckCircle2}
        variant="accent"
      />
      <KpiCard
        title="Overdue Accounts"
        value={stats.overdueAccounts}
        icon={AlertTriangle}
        variant="danger"
      />
    </div>
  );
}
