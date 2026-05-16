'use client';

import { Download, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReportSectionProps {
  title: string;
  description: string;
  count: number;
  canExport: boolean;
  toolbar?: React.ReactNode;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
  children: React.ReactNode;
}

export function ReportSection({
  title,
  description,
  count,
  canExport,
  toolbar,
  onExportPdf,
  onExportCsv,
  children,
}: ReportSectionProps) {
  return (
    <section className="rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="border-b border-border px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-primary">{title}</h2>
            <p className="mt-0.5 text-sm text-muted">{description}</p>
            <p className="mt-1 text-xs text-muted">
              {count} record{count !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            {canExport ? (
              <>
                {onExportCsv ? (
                  <Button type="button" variant="outline" size="sm" onClick={onExportCsv}>
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                ) : null}
                {onExportPdf ? (
                  <Button type="button" variant="outline" size="sm" onClick={onExportPdf}>
                    <FileDown className="h-4 w-4" />
                    PDF
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </header>
      {children}
    </section>
  );
}
