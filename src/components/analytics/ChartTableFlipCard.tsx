'use client';

import { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface ChartTableFlipCardProps {
  title: string;
  description?: string;
  chart: React.ReactNode;
  table: React.ReactNode;
  height?: string;
  className?: string;
}

export function ChartTableFlipCard({
  title,
  description,
  chart,
  table,
  height = 'h-72',
  className,
}: ChartTableFlipCardProps) {
  const [showTable, setShowTable] = useState(false);

  return (
    <Card padding="lg" className={className}>
      <CardHeader
        title={title}
        description={description}
        action={
          <button
            type="button"
            onClick={() => setShowTable((v) => !v)}
            aria-pressed={showTable}
            aria-label={showTable ? 'Show chart view' : 'Show table view'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-surface"
          >
            {showTable ? (
              <>
                <BarChart3 className="h-3.5 w-3.5" aria-hidden />
                Chart
              </>
            ) : (
              <>
                <Table2 className="h-3.5 w-3.5" aria-hidden />
                Table
              </>
            )}
          </button>
        }
      />
      <div className={cn('chart-flip-scene relative w-full', height)}>
        <div
          className={cn('chart-flip-inner relative h-full w-full', showTable && 'is-flipped')}
        >
          <div className="chart-flip-face absolute inset-0 h-full w-full">{chart}</div>
          <div className="chart-flip-face chart-flip-face-back absolute inset-0 h-full w-full overflow-auto">
            {table}
          </div>
        </div>
      </div>
    </Card>
  );
}
