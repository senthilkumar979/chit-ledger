'use client';

import { useRouter } from 'next/navigation';
import {
  Calendar,
  IndianRupee,
  MapPin,
  Percent,
  TrendingUp,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { buildGrantDisplayMetrics } from '@/utils/grant-metrics';
import { rateToPercentLabel } from '@/utils/loan-calculations';
import type { Grant } from '@/types/database';

interface GrantsTableProps {
  grants: Grant[];
  onDelete?: (grant: Grant) => void;
  emptyMessage: string;
}

export function GrantsTable({ grants, onDelete, emptyMessage }: GrantsTableProps) {
  const router = useRouter();

  if (!grants.length) {
    return <p className="px-4 py-12 text-center text-sm text-muted sm:px-6">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-surface/80 text-[10px] font-semibold uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3">Grant to</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Interest from</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Interest / mo</th>
              <th className="px-4 py-3">Interest so far</th>
              {onDelete ? <th className="px-4 py-3" /> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {grants.map((grant) => (
              <GrantRow key={grant.id} grant={grant} onDelete={onDelete} onOpen={() => router.push(`/grants/${grant.id}`)} />
            ))}
          </tbody>
        </table>
      </div>
      <ul className="divide-y divide-border/60 md:hidden">
        {grants.map((grant) => (
          <GrantMobileRow key={grant.id} grant={grant} onDelete={onDelete} onOpen={() => router.push(`/grants/${grant.id}`)} />
        ))}
      </ul>
    </>
  );
}

function GrantRow({
  grant,
  onOpen,
  onDelete,
}: {
  grant: Grant;
  onOpen: () => void;
  onDelete?: (grant: Grant) => void;
}) {
  const metrics = buildGrantDisplayMetrics(grant);

  return (
    <tr className="cursor-pointer hover:bg-surface/50" onClick={onOpen}>
      <td className="px-4 py-3">
        <GrantToCell grant={grant} />
      </td>
      <td className="px-4 py-3 font-medium tabular-nums text-primary">
        <span className="inline-flex items-center gap-1.5">
          <IndianRupee className="h-3.5 w-3.5 text-muted" />
          {formatCurrency(grant.amount)}
        </span>
      </td>
      <td className="px-4 py-3 text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(grant.interest_start_date)}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge variant="danger" className="gap-1 tabular-nums">
          <Percent className="h-3 w-3" />
          {rateToPercentLabel(grant.interest_rate)}/mo
        </Badge>
      </td>
      <td className="px-4 py-3 tabular-nums text-muted">
        {formatCurrency(metrics.monthlyInterest)}
      </td>
      <td className="px-4 py-3 font-medium tabular-nums text-warning">
        <span className="inline-flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          {formatCurrency(metrics.interestSoFar)}
        </span>
      </td>
      {onDelete ? (
        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
          <Button type="button" size="sm" variant="outline" className="text-danger" onClick={() => onDelete(grant)}>
            Delete
          </Button>
        </td>
      ) : null}
    </tr>
  );
}

function GrantMobileRow({
  grant,
  onOpen,
  onDelete,
}: {
  grant: Grant;
  onOpen: () => void;
  onDelete?: (grant: Grant) => void;
}) {
  const metrics = buildGrantDisplayMetrics(grant);

  return (
    <li>
      <button type="button" className="w-full px-4 py-4 text-left hover:bg-surface/50" onClick={onOpen}>
        <GrantToCell grant={grant} compact />
        <p className="mt-2 flex items-center gap-1 font-semibold tabular-nums text-primary">
          <IndianRupee className="h-4 w-4 text-accent" />
          {formatCurrency(grant.amount)}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="danger" className="gap-1">
            <Percent className="h-3 w-3" />
            {rateToPercentLabel(grant.interest_rate)}/mo
          </Badge>
          <span className="text-xs text-warning">{formatCurrency(metrics.interestSoFar)} accrued</span>
        </div>
      </button>
      {onDelete ? (
        <div className="border-t border-border/60 px-4 pb-3">
          <Button type="button" size="sm" variant="outline" className="w-full text-danger" onClick={() => onDelete(grant)}>
            Delete
          </Button>
        </div>
      ) : null}
    </li>
  );
}

function GrantToCell({ grant, compact }: { grant: Grant; compact?: boolean }) {
  if (!grant.grant_to) return <span className="text-muted">—</span>;

  return (
    <div className={cn('min-w-0', compact ? 'text-xs' : 'text-sm')}>
      <p className="flex items-center gap-1.5 font-medium text-primary">
        <User className="h-3.5 w-3.5 shrink-0 text-accent/80" />
        <span className="truncate">{grant.grant_to.name}</span>
      </p>
      <p className="mt-0.5 flex items-center gap-1 text-muted">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{grant.grant_to.city}</span>
      </p>
    </div>
  );
}
