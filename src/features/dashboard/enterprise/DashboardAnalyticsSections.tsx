'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTableFlipCard } from '@/components/analytics/ChartTableFlipCard'
import { ChartPanel } from '@/components/analytics/ChartPanel'
import { DataTable, type DataTableColumn } from '@/components/analytics/DataTable'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { formatMonthLabel, getCurrentMonthKey } from '@/utils/payment-month'
import type {
  EnterpriseDashboardMetrics,
  MaturityDetailRow,
  MemberLeaderboardRow,
} from '@/utils/enterprise-metrics'
import { DashboardInsightCards } from './DashboardInsightCards'

interface DashboardAnalyticsSectionsProps {
  metrics: EnterpriseDashboardMetrics
  selectedMonthKey?: string
  onMonthSelect: (monthKey: string) => void
}

export function DashboardAnalyticsSections({
  metrics,
  selectedMonthKey,
}: DashboardAnalyticsSectionsProps) {
  const router = useRouter()
  const selectedMonthLabel = formatMonthLabel(
    selectedMonthKey ?? getCurrentMonthKey(),
  )
  const maturityColumns: DataTableColumn<MaturityDetailRow>[] = [
    { id: 'member', header: 'Member', accessor: (row) => row.member },
    { id: 'city', header: 'City', accessor: (row) => row.city, hiddenOnMobile: true },
    { id: 'scheme', header: 'Scheme', accessor: (row) => row.scheme },
    { id: 'schedule', header: 'Schedule', accessor: (row) => row.schedule, hiddenOnMobile: true },
    {
      id: 'endDate',
      header: 'End date',
      accessor: (row) => (row.endDate ? formatDate(row.endDate) : '—'),
    },
    { id: 'daysLeft', header: 'Days left', accessor: (row) => row.daysLeft },
    { id: 'netPayout', header: 'Net payout', accessor: (row) => row.netPayout, isCurrency: true },
  ]
  const funnelData = [
    { stage: 'Expected', value: metrics.funnel.expected },
    { stage: 'Collected', value: metrics.funnel.collected },
    { stage: 'Shortfall', value: metrics.funnel.shortfall },
  ]

  return (
    <div className="space-y-8">
      {/* <ChartPanel
        title="Cash flow intelligence"
        description="Where is money coming and going? Tap a month to filter widgets."
        height="h-80"
      >
        <CashFlowComboChart
          data={metrics.cashFlow}
          activeMonthKey={selectedMonthKey}
          onMonthSelect={onMonthSelect}
        />
      </ChartPanel> */}

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPanel
          title="Collection efficiency"
          description={`How efficient are collections for ${selectedMonthLabel}?`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                tickFormatter={(v) => `₹${Number(v) / 1000}k`}
              />
              <YAxis type="category" dataKey="stage" width={72} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                <Cell fill="#0F172A" />
                <Cell fill="#16A34A" />
                <Cell fill="#DC2626" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel
          title="Collection trend"
          description="Are we consistently under-collecting?"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.collectionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `₹${Number(v) / 1000}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Legend />
              <Line
                dataKey="expected"
                stroke="#94A3B8"
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                dataKey="actual"
                stroke="#16A34A"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      <ChartPanel
        title="Top members by portfolio value"
        description="Which members currently hold the largest active chit value?"
        height="h-72"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={metrics.topMembers}
            layout="vertical"
            onClick={(s) => {
              const payload = s as {
                activePayload?: { payload?: MemberLeaderboardRow }[]
              } | null
              const id = payload?.activePayload?.[0]?.payload?.personId
              if (id) router.push(`/persons/${id}`)
            }}
          >
            <XAxis
              type="number"
              tickFormatter={(v) => `₹${Number(v) / 1000}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={88}
              tick={{ fontSize: 10 }}
            />
            <Tooltip
              formatter={(v, _name, item) => [
                formatCurrency(Number(v)),
                `${item?.payload?.activeChitCount ?? 0} active chits`,
              ]}
            />
            <Bar
              dataKey="portfolioValue"
              fill="#0F172A"
              radius={[0, 4, 4, 0]}
              className="cursor-pointer"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

      <DashboardInsightCards
        metrics={metrics}
        selectedMonthLabel={selectedMonthLabel}
      />

      <ChartTableFlipCard
        title="Maturity pipeline"
        description="Which unwithdrawn chits are nearing maturity?"
        chart={
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.maturityPipeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tickFormatter={(v) => String(v)} />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={(v) => `₹${Number(v) / 1000}k`}
              />
              <Tooltip />
              <Bar
                yAxisId="left"
                dataKey="count"
                name="Chits"
                fill="#0F172A"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="liability"
                name="Liability"
                fill="#DC2626"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        }
        table={
          <DataTable
            columns={maturityColumns}
            data={metrics.maturityDetails}
            rowKey={(row) => row.chitId}
            exportFilename="maturity-pipeline.csv"
            pageSize={10}
          />
        }
      />

      <AlertsPanel alerts={metrics.alerts} />
    </div>
  )
}

function AlertsPanel({
  alerts,
}: {
  alerts: EnterpriseDashboardMetrics['alerts']
}) {
  if (!alerts.length) {
    return (
      <section className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted">
        No priority alerts today.
      </section>
    )
  }

  const severityStyle = {
    critical: 'border-danger/30 bg-danger/5',
    warning: 'border-warning/30 bg-warning/5',
    info: 'border-border bg-surface/40',
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-primary">Priority alerts</h2>
      <p className="text-sm text-muted">What needs action today?</p>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
              severityStyle[alert.severity],
            )}
          >
            <div>
              <p className="font-semibold text-primary">{alert.title}</p>
              <p className="text-sm text-muted">{alert.description}</p>
            </div>
            <Link
              href={alert.href}
              className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              {alert.actionLabel}
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}
