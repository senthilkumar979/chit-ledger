# ChitLedger — Functional & Technical Specification

**Version:** 0.1.0 (as of May 2026)  
**Purpose:** Share with AI assistants (e.g. Gemini) for feature improvement ideas, especially dashboard and report visualizations.

---

## 1. Product overview

**ChitLedger** is an internal web application for operating and accounting **chit funds** (rotating savings/credit schemes) for members. It tracks:

- **Members** (persons) and their **chits** (20-installment contracts)
- **Installment collections** (payments) with variance vs expected amounts
- **Maturity and withdrawal** payouts
- **Loans** taken to fund operations, with partial repayments, interest, and yearly profit/loss vs chit revenue

The app is used by a small team (admin, staff, viewers) with role-based access. Currency is **Indian Rupees (₹)**; amounts use Indian grouping in forms where applicable.

---

## 2. Technology stack

| Layer | Technology |
|--------|------------|
| Framework | **Next.js 16** (App Router, React 19) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS 4** |
| Backend / DB | **Supabase** (Postgres, Auth, Row Level Security, Storage) |
| Client data | **TanStack Query v5** |
| Forms | **react-hook-form** + **Zod** |
| Charts | **Recharts** |
| PDF export | **jsPDF** + **jspdf-autotable** |
| Dates | **date-fns** |
| Icons | **lucide-react** |
| Toasts | **sonner** |

**Deployment:** Vercel-compatible Next.js app; env via `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Project layout (high level):**

```
src/
  app/(app)/          # Authenticated routes
  features/           # Feature UI (chits, dashboard, loans, reports, …)
  services/           # Supabase API layer
  utils/              # Business logic (metrics, loan math, PDF)
  components/         # Shared UI + charts
  constants/          # Chit types, categories, roles
  schemas/            # Zod validation
  types/database.ts   # Domain types
supabase/migrations/  # SQL schema
```

---

## 3. Authentication & authorization

### 3.1 Auth flow

- Supabase Auth (email/password or configured providers)
- On signup: trigger `handle_new_user()` creates a row in `profiles`
- Session handled via `@supabase/ssr` in Next.js middleware/layout

### 3.2 Roles (`user_role` enum)

| Role | Read | Write (create/update) | Delete | Export PDF/CSV | Manage users | Manage loans |
|------|------|------------------------|--------|----------------|--------------|--------------|
| **ADMIN** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **STAFF** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **VIEWER** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

Implemented in `src/lib/permissions.ts` via `getPermissions(role)`.

### 3.3 RLS helpers (Postgres)

- `get_user_role()` — current user's role from `profiles`
- `can_write()` — ADMIN or STAFF
- `is_admin()` — ADMIN only

Loans and `loan_repayments` are **admin-only** for insert/update/delete; all authenticated users can read.

---

## 4. Database schema

Migrations live under `supabase/migrations/` (apply in order).

### 4.1 Entity relationship (conceptual)

```
auth.users ──1:1── profiles
persons ──1:N── chits ──1:N── payments
loans ──1:N── loan_repayments
storage: withdrawal-proofs (files linked from chits.withdrawal_proof_url)
```

### 4.2 `profiles`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | FK → auth.users |
| email | text | |
| full_name | text | nullable |
| role | user_role | default VIEWER |
| created_at, updated_at | timestamptz | |

### 4.3 `persons` (members)

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | |
| name | text | required |
| city | text | required |
| phone, notes | text | nullable |
| created_at, updated_at | timestamptz | |

### 4.4 `chits`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | |
| person_id | uuid FK → persons | ON DELETE RESTRICT |
| type | text | `ONE_LAKH` \| `TWO_LAKH` |
| category | text | Collection schedule label (see §5.2) |
| start_date, end_date | date | nullable; end often start + 20 months |
| matured | boolean | default false; set when installment 20 paid |
| withdrawal | boolean | payout recorded |
| withdrawal_date | date | |
| withdrawal_by | text | |
| withdrawal_payment_mode | text | |
| withdrawal_proof_url | text | Supabase Storage URL |
| collection_variance | numeric(12,2) | optional; cumulative extra/shortfall on chit |
| withdrawal_net_amount | numeric(12,2) | optional; net maturity payout |
| created_at, updated_at | timestamptz | |

**Trigger:** `on_chit_created` → `create_installments_for_chit()` inserts **20** `payments` rows with fixed schedules per type (see §5.1).

### 4.5 `payments` (installments)

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | |
| chit_id | uuid FK → chits | CASCADE delete |
| installment_no | int | 1–20, unique per chit |
| expected_amount | numeric(12,2) | From chit schedule |
| maturity_amount | numeric(12,2) | Maturity ladder value for that installment |
| paid_date | date | nullable |
| payment_mode, paid_to | text | nullable |
| advance_amount_paid | numeric(12,2) | default 0; primary stored collection amount |
| amount_paid | numeric(12,2) | added in migration; preferred if set |
| status | text | `pending` \| `paid` \| `partial` \| `overdue` |
| created_at, updated_at | timestamptz | |

**Unique:** `(chit_id, installment_no)`.

**Recorded amount logic (app):** `getRecordedAmount()` uses `amount_paid ?? advance_amount_paid`. A payment “counts” as recorded when `status` is `paid` or `partial`.

### 4.6 `loans`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | |
| principal | numeric(14,2) | > 0 |
| interest_rate | numeric(8,6) | default **0.01** (1% per month) |
| interest_amount | numeric(14,2) | null while active; total interest when closed |
| repayment_amount | numeric(14,2) | null while active; cumulative repaid when closed |
| status | loan_status | `active` \| `closed` |
| start_date | date | required |
| closed_date | date | required when closed |
| notes | text | |
| created_at, updated_at | timestamptz | |

**Check constraint `loans_closed_fields`:**

- **active:** `closed_date`, `interest_amount`, `repayment_amount` must all be null
- **closed:** all three must be non-null

### 4.7 `loan_repayments`

| Column | Type | Notes |
|--------|------|--------|
| id | uuid PK | |
| loan_id | uuid FK → loans | CASCADE |
| repayment_date | date | |
| principal_paid | numeric(14,2) | ≥ 0 |
| interest_paid | numeric(14,2) | ≥ 0 |
| is_final | boolean | default false; true for closure row |
| notes | text | |
| created_at, updated_at | timestamptz | |

**Check:** `principal_paid + interest_paid > 0`.

Deleting a repayment recalculates loan state (reopens loan if final repayment removed).

### 4.8 Storage

- Bucket: `withdrawal-proofs` (public read)
- Policies: STAFF+ can upload; all authenticated can read; ADMIN can delete

---

## 5. Domain rules — Chits & payments

### 5.1 Chit types & installment schedules

Two schemes, each with **20 installments** (`INSTALLMENT_COUNT = 20`):

**ONE_LAKH (`ONE_LAKH`)** — ₹1 Lakh scheme  

- Payment amounts (installments 1–20):  
  `5000, 4000, 4060, 4120, …, 4950, 3000`  
- Maturity ladder (per installment):  
  `73800 … 95000` (increasing; final ~₹95k)

**TWO_LAKH (`TWO_LAKH`)** — ₹2 Lakh scheme  

- Payment amounts:  
  `5000, 4267.5, 4310, …, 4962.5, 3950`  
- Maturity ladder:  
  `81500 … 97000`

Schedules are duplicated in:

- DB trigger `create_installments_for_chit()` (JSON in SQL)
- `src/constants/chit-config.ts` (source of truth for app)

### 5.2 Collection schedules (`chits.category`)

Normalized values:

- `5th of every month`
- `20th of every month`

Used for reporting breakdowns and due-date UX (category label, not day-of-month enforcement in DB).

### 5.3 Installment due dates

- Installment **N** is due in calendar month: `start_date + (N - 1) months`
- Implemented in `getInstallmentDueDate()`, `isInstallmentDueInMonth()`
- Chit `end_date` typically `start_date + 20 months`

### 5.4 Payment statuses

| Status | Meaning |
|--------|---------|
| pending | Not paid |
| partial | Some amount recorded; balance still due on that installment |
| paid | Full installment recorded |
| overdue | Marked overdue (operational flag) |

### 5.5 Collection variance

Per installment: `collected - expected` when recorded.

Per chit (`summarizeChitPayments`):

- **totalCollected** — sum of recorded amounts
- **totalExpectedOnRecorded** — sum of expected for recorded installments
- **collectionVariance** — totalCollected − totalExpectedOnRecorded
- **netMaturityPayout** — `maturity_amount(installment 20) + collectionVariance`

Labels: Extra paid / Shortfall / Balanced.

### 5.6 Maturity & withdrawal

- Paying installment **20** can auto-set `chits.matured = true`
- **Withdrawal** records payout to member: date, mode, handler, optional proof file
- Reports track **matured awaiting withdrawal** (matured but `withdrawal = false`)

---

## 6. Domain rules — Loans

### 6.1 Interest model

- Default **1% of principal per calendar month** (`DEFAULT_LOAN_INTEREST_RATE = 0.01`)
- Rate overridable per loan at take/close
- **Months held:** inclusive calendar months from period start through repayment date  
  `differenceInCalendarMonths(end, start) + 1`, minimum 1
- **Period interest** = `monthlyInterest × monthsHeld`  
  where `monthlyInterest = outstandingPrincipal × rate`

### 6.2 Partial repayment

- Admin records `principal_paid` + `interest_paid` on a date
- Interest default: from **last repayment date** (or loan `start_date`) to repayment date, on **outstanding principal**
- Cannot pay full outstanding principal only without interest via partial flow (must use Close loan)

### 6.3 Close loan

- Pays remaining **outstanding principal** + **closing interest** for current period
- Inserts `loan_repayments` row with `is_final = true`
- Updates loan: `status = closed`, cumulative `interest_amount`, `repayment_amount`, `closed_date`

### 6.4 Balance summary (`summarizeLoanBalance`)

For a loan + its repayments:

- **principalRepaid** — sum of `principal_paid`
- **principalOutstanding** — `loan.principal - principalRepaid`
- **interestPaidToDate** — sum of `interest_paid`
- **totalRepaidToDate** — principal + interest repaid
- **lastRepaymentDate** — latest `repayment_date`

### 6.5 Yearly profit / loss (`/loans`)

For selected calendar year:

- **Chit revenue** — sum of `getRecordedAmount()` for payments with `paid_date` in year
- **Loan interest expense** — sum of `interest_paid` from `loan_repayments` with `repayment_date` in year (fallback to closed loan `interest_amount` if no repayment rows — legacy)
- **Net profit** = chit revenue − loan interest expense
- Also: loans taken/closed counts, principal borrowed/repaid in year

---

## 7. Application routes & features

| Route | Feature | Primary actions |
|-------|---------|-----------------|
| `/dashboard` | Month-scoped operations view | Filter month, KPIs, charts, collections/due tables, PDF export collections |
| `/persons` | Member list | CRUD members |
| `/persons/[id]` | Member detail | Member info, linked chits |
| `/chits` | Chit list | List/filter chits |
| `/chits/[id]` | Chit detail | Schedule, mark/edit payment, withdrawal, PDF export, delete chit |
| `/payments` | Global payment list | Cross-chit payment operations |
| `/loans` | Loans + P&L | Take loan, list active/closed, yearly P&L panel |
| `/loans/[id]` | Loan detail | Summary, repayment history, partial repayment, close loan, delete repayment/loan |
| `/reports` | Analytics & tables | KPIs, charts, collection/outstanding/matured/portfolio tables, PDF/CSV export |
| `/settings` | Admin settings | User/profile management (admin) |
| `/auth/login` | Login | |

---

## 8. Dashboard (`/dashboard`) — current behavior

### 8.1 Data sources

- `fetchDashboardData()` — payments with chit/person joins, chit counts, analytics bundle
- Month selector drives most KPIs (calendar month of **paid_date**, not due month)

### 8.2 KPIs (`DashboardMonthKpis`)

| Metric | Definition |
|--------|------------|
| collectedInMonth | Sum recorded amounts where `paid_date` in selected month |
| expectedOnPaidInMonth | Sum `expected_amount` for those same payments |
| extraCollectedInMonth | max(0, collected − expected) |
| shortfallInMonth | max(0, expected − collected) |
| paymentsRecordedInMonth | Count of payments paid in month |
| installmentsDueInMonth | Installments whose **due month** matches selection |
| installmentsPaidInMonth | Due installments with status paid |
| amountDueRemaining | Pending amount on due-but-not-paid installments |
| dueChitsCount | Distinct chits with amount due in month |
| overdueCount | Due installments with status overdue |
| totalChits / activeChits / maturedChits / withdrawnChits | From chit flags |

### 8.3 Charts (Recharts)

| Chart | Data |
|-------|------|
| **MonthComparisonChart** | Expected vs collected for selected month |
| **VarianceTrendChart** | Last 8 months: extra vs shortfall aggregates |
| **RevenueChart** | Last 8 months collection totals (`analytics.byMonth`) |
| **BreakdownBarChart** ×3 | This month only: by scheme (₹1L/₹2L), by schedule category, by city (top 8) |

### 8.4 Tables & filters

- **Collections this month** — paid in calendar month; search, status, city, category filters
- **Due this month** — installments due in month; similar filters
- **CollectionsExportButton** — PDF of filtered collections (landscape)

### 8.5 Gaps / not on dashboard today

- No loan metrics on dashboard (only on `/loans`)
- No maturity/withdrawal pipeline chart
- No member-level leaderboard
- P&L not integrated on dashboard

---

## 9. Reports (`/reports`) — current behavior

### 9.1 Data pipeline

`fetchReportsData()` → payments + chits + `fetchAnalytics()` → `buildReportsBundle()`

### 9.2 KPIs (`ReportsKpis`) — lifetime / all-time

| Metric | Definition |
|--------|------------|
| totalCollected | All recorded payment amounts |
| totalExpectedOnPaid | Expected sum for recorded installments |
| collectionVariance | totalCollected − totalExpectedOnPaid |
| totalOutstanding | Unpaid + partial balances |
| overdueInstallments / partialInstallments / pendingInstallments / paidInstallments | Counts by status |
| activeChits / maturedChits / withdrawnChits / totalChits | Portfolio counts |
| maturedAwaitingWithdrawal | Matured, not withdrawn |

### 9.3 Charts

| Chart | Data |
|-------|------|
| **RevenueChart** | Collections by month (last 8) |
| **DistributionPieChart** — Installment status | Counts: pending, paid, partial, overdue |
| **DistributionPieChart** — Chit portfolio | Active / matured / withdrawn |
| **BreakdownBarChart** — By scheme | Lifetime collections by ONE_LAKH vs TWO_LAKH |
| **BreakdownBarChart** — By schedule | Lifetime by category |
| **BreakdownBarChart** — Top cities | Lifetime by member city (top 8) |

### 9.4 Report tables (with export)

| Section | Content | Export |
|---------|---------|--------|
| Collection history | All recorded payments; month filter | PDF, CSV (admin) |
| Outstanding installments | pending/partial/overdue balances | PDF, CSV |
| Matured chits | Net payout, withdrawal status | PDF |
| Awaiting withdrawal | Matured, not withdrawn | PDF |
| Full portfolio | Per-chit lifecycle, paid count, collected, outstanding | PDF, CSV |

### 9.5 Analytics service (`fetchAnalytics`)

Aggregates **paid** payments only:

- `byMonth`, `byType`, `byCity`, `byCategory`
- Uses `advance_amount_paid` or falls back to `expected_amount` if paid but amount zero

---

## 10. Loans module — UI summary

### `/loans`

- Hero: active count, pending principal, loans in year, interest paid in year, all-time count
- **ProfitLossPanel:** year selector, net profit/loss, revenue vs interest, principal borrowed/repaid
- Tables: active loans (click → detail), closed history
- Modal: take new loan

### `/loans/[id]`

- Summary cards: original/outstanding principal, repaid, interest paid, rate, dates, status
- Repayment history table with delete (admin)
- Modals: partial repayment, close loan, delete loan, delete repayment (with contextual warnings)

---

## 11. Chit detail — UI summary

- Hero + progress (installments paid)
- Stats: collected, outstanding, variance, maturity payout
- Payment schedule (desktop table + mobile cards)
- Mark payment / edit payment (amount, date, mode, paid to)
- Withdrawal form + proof upload
- PDF export: member, schedule, financial summary, maturity/withdrawal
- Delete chit (admin, confirm modal)

---

## 12. PDF & CSV exports

| Export | Location | Format |
|--------|----------|--------|
| Chit detail | Chit detail page | PDF (jsPDF; uses `Rs.` not `₹` for font compatibility) |
| Dashboard collections | Dashboard | PDF (filtered month) |
| Report sections | Reports | PDF per section; CSV for collections, outstanding, portfolio |
| Report tables | `export-report-pdf.ts`, `export-csv.ts` | Branded headers/footers |

Export permission: **ADMIN** only (`canExport`).

---

## 13. Key services (API layer)

| Service | Responsibility |
|---------|----------------|
| `persons.ts` | CRUD members |
| `chits.ts` | CRUD chits, fetch with payments |
| `payments.ts` | markPayment, updatePayment, resetPayment, status updates |
| `withdrawals.ts` | Record withdrawal, upload proof |
| `analytics.ts` | Chart aggregates |
| `dashboard.ts` | Dashboard bundle |
| `reports.ts` | Reports bundle |
| `loans.ts` | Loans CRUD, partial/close, delete repayment, closing breakdown |
| `profit-loss.ts` | Loans + payments for P&L year picker |

---

## 14. Important utility modules

| Module | Role |
|--------|------|
| `chit-payment-summary.ts` | Recorded amount, variance, chit-level summary, net maturity |
| `payment-month.ts` | Month keys, due-in-month vs paid-in-month filters |
| `installment-due.ts` | Due date math, pending amount |
| `dashboard-metrics.ts` | Month KPIs, variance trend, month breakdowns |
| `report-metrics.ts` | Reports KPIs, table row builders, portfolio mix |
| `profit-loss-metrics.ts` | Year P&L, loan year stats, repayment-aware interest |
| `loan-calculations.ts` | Month counting, interest breakdown |
| `loan-balance.ts` | Outstanding principal, repayment summaries |
| `amount-input.ts` | Indian number formatting for forms |

---

## 15. TanStack Query keys

| Key | Invalidated when |
|-----|------------------|
| `dashboard-data` | Payments, chits change |
| `profit-loss-data` | Loans, repayments change |
| `reports-data` | Payments, chits change |
| `loan`, `loans` | Loan operations |
| `chit`, `chitId` | Chit/payment operations |
| `person`, persons | Person operations |

`invalidateLoanQueries(queryClient, loanId?)` centralizes loan-related invalidation.

---

## 16. Validation schemas (Zod)

- `takeLoanSchema` — principal, rate, start_date, notes
- `partialRepaymentSchema` — date, principal_paid, interest_paid (sum > 0)
- `closeLoanSchema` — closed_date, interest_amount, repayment_amount
- Payment/chit/person schemas in respective `src/schemas/` files

---

## 17. Known constraints & technical debt

1. **`amount_paid` column** — Migration exists; remote DB may still use only `advance_amount_paid`. App reads both; P&L query may omit `amount_paid` on some environments.
2. **Loan interest on P&L** — Driven by `loan_repayments.interest_paid` by year; legacy closed loans without rows use `loans.interest_amount`.
3. **Analytics** — Only includes `status = paid` payments; partial/overdue excluded from lifetime revenue charts.
4. **Dashboard month** — “Collections” use **payment date** month; “Due” uses **installment due** month — intentional but can confuse users.
5. **No multi-tenant** — Single organization; no `org_id` on tables.
6. **No audit log** — No history of who changed what.
7. **No notifications/reminders** — No email/SMS for due dates.
8. **Charts library** — Recharts only; no dedicated loan or P&L charts outside loans page summary panel.

---

## 18. Suggested prompts for Gemini (feature & charts)

Use this document as context, then ask for example:

1. **Dashboard enhancements**  
   - Widgets for loan exposure, net P&L YTD, maturity pipeline  
   - Combined “cash in vs cash out” waterfall  
   - Aging buckets for overdue installments  
   - MoM collection growth rate and forecast  

2. **Reports enhancements**  
   - Cohort analysis by chit `start_date` month  
   - Variance distribution histogram  
   - City/scheme heatmap  
   - Withdrawal SLA (days from maturity to withdrawal)  
   - Loan interest as % of chit revenue trend  

3. **Cross-cutting**  
   - Drill-down from chart → filtered table  
   - Date range picker (not only single month)  
   - Compare two months / two years side by side  
   - Export chart as PNG/PDF  
   - Role-based dashboard layouts  

4. **Data quality**  
   - Alerts when `partial` installments age > N days  
   - Reconciliation report: sum(payments) vs expected schedule  

---

## 19. Migration checklist (Supabase)

Apply in order:

1. `20260515000001_initial_schema.sql`
2. `20260515000002_auto_installments.sql`
3. `20260515000003_storage.sql`
4. `20260516000001_chit_category_schedules.sql` (data normalize)
5. `20260516000002_payment_amount_paid.sql`
6. `20260517000001_loans.sql`
7. `20260518000001_loan_repayments.sql`

---

## 20. Glossary

| Term | Meaning in ChitLedger |
|------|---------------------|
| Chit | A 20-installment contract for one member under ONE_LAKH or TWO_LAKH rules |
| Installment | One scheduled payment row (`payments`) |
| Maturity | Completion of installment 20; maturity ladder defines payout base |
| Withdrawal | Actual payout to member after maturity |
| Collection variance | Total extra or shortfall vs expected on recorded payments |
| Schedule / category | 5th vs 20th monthly collection label |
| Partial repayment | Loan payment that reduces principal and/or pays interest before closure |

---

*Document generated for the ChitLedger codebase. Update when schema or features change.*
