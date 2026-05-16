'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportCollectionsToPdf } from '@/utils/pdf/export-collections-pdf';
import type { DashboardMonthKpis } from '@/utils/dashboard-metrics';
import type { PaymentWithChit } from '@/utils/payment-month';
import { toast } from 'sonner';

interface CollectionsExportButtonProps {
  monthLabel: string;
  rows: PaymentWithChit[];
  kpis: DashboardMonthKpis;
  search: string;
  statusFilter: string;
  cityFilter: string;
  categoryFilter: string;
}

export function CollectionsExportButton({
  monthLabel,
  rows,
  kpis,
  search,
  statusFilter,
  cityFilter,
  categoryFilter,
}: CollectionsExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport() {
    try {
      setIsExporting(true);
      exportCollectionsToPdf({
        monthLabel,
        rows,
        kpis: {
          collectedInMonth: kpis.collectedInMonth,
          expectedOnPaidInMonth: kpis.expectedOnPaidInMonth,
          extraCollectedInMonth: kpis.extraCollectedInMonth,
          shortfallInMonth: kpis.shortfallInMonth,
          paymentsRecordedInMonth: kpis.paymentsRecordedInMonth,
        },
        filters: {
          search: search || undefined,
          status: statusFilter || undefined,
          city: cityFilter || undefined,
          category: categoryFilter || undefined,
        },
      });
      toast.success('Collections PDF downloaded');
    } catch {
      toast.error('Could not generate PDF');
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="shrink-0 border-border/80 bg-card"
      isLoading={isExporting}
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
