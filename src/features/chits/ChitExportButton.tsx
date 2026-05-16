'use client';

import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { exportChitToPdf } from '@/utils/pdf/export-chit-pdf';
import { toast } from 'sonner';
import type { ChitWithPayments } from '@/types/database';

interface ChitExportButtonProps {
  chit: ChitWithPayments;
}

export function ChitExportButton({ chit }: ChitExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  function handleExport() {
    try {
      setIsExporting(true);
      exportChitToPdf(chit);
      toast.success('PDF downloaded');
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
      className="border-border/80 bg-blue-500 text-white"
      isLoading={isExporting}
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4" />
      Export PDF
    </Button>
  );
}
