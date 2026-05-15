# ChitLedger — Cursor Master Prompt

You are a senior full-stack product engineer.

Build a production-grade **mobile-first finance application** called **ChitLedger**.

This is a professional chit fund / finance ledger system for managing:

- Members
- Chits
- Installments
- Withdrawals
- Maturity tracking
- Financial reports
- Admin operations

This product must look **premium**, **enterprise-grade**, and **highly polished**.

Do NOT build basic CRUD-looking screens.

The design must feel comparable to modern fintech dashboards.

---

# Tech Stack

Use:

## Frontend

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod
- TanStack Query
- Lucide React Icons

## Backend

Use Supabase for:

- Authentication
- PostgreSQL Database
- Storage
- Row Level Security

## Testing

Use:

- React Testing Library
- Jest

## Hosting

Deploy on Vercel

---

# Design Requirements

Build a premium UI.

## Design Style

Follow:

- Clean spacing
- Modern typography
- Premium fintech feel
- Smooth micro interactions
- Elegant transitions
- Strong visual hierarchy

Inspired by:

- Stripe Dashboard
- Linear
- Ramp
- Brex
- Mercury Banking

## UI Principles

### Mobile First

Design for mobile first.

Then scale to:

- Tablet
- Desktop

### Responsive Behavior

#### Mobile

Use:

- Bottom navigation
- Full-width cards
- Sticky action buttons
- Swipe-friendly tables

#### Desktop

Use:

- Left sidebar
- Sticky header
- Data tables
- Split layouts

---

# Theme Palette

Use:

```css
Primary: #0F172A
Secondary: #1E293B
Accent: #16A34A
Info: #0284C7
Warning: #F59E0B
Danger: #DC2626
Surface: #F8FAFC
Card: #FFFFFF
Border: #E2E8F0
Muted: #64748B
```

---

# Typography

Use:

- Inter font

Typography scale:

```txt
Hero: text-3xl font-bold
Section Title: text-xl font-semibold
Card Title: text-lg font-semibold
Body: text-sm
Caption: text-xs
```

---

# Folder Structure

Generate:

```txt
src/
 ├── app/
 │   ├── dashboard/
 │   ├── persons/
 │   ├── chits/
 │   ├── payments/
 │   ├── reports/
 │   ├── settings/
 │   └── auth/
 │
 ├── components/
 │   ├── ui/
 │   ├── layout/
 │   ├── cards/
 │   ├── charts/
 │   ├── tables/
 │   ├── forms/
 │   └── feedback/
 │
 ├── features/
 │   ├── auth/
 │   ├── persons/
 │   ├── chits/
 │   ├── payments/
 │   ├── withdrawals/
 │   └── reports/
 │
 ├── hooks/
 ├── lib/
 ├── services/
 ├── schemas/
 ├── constants/
 ├── types/
 ├── utils/
 └── tests/
```

---

# Authentication

Implement Supabase auth.

Roles:

```txt
ADMIN
STAFF
VIEWER
```

Permissions:

## ADMIN

Can:

- Create
- Edit
- Delete
- Export
- Manage users

## STAFF

Can:

- Create
- Edit
- Add payments

## VIEWER

Can:

- Read only

Protect all routes.

---

# Database Schema

Use migrations.

---

# Table: persons

```sql
create table persons (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 city text not null,
 phone text,
 notes text,
 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
```

---

# Table: chits

```sql
create table chits (
 id uuid primary key default gen_random_uuid(),
 person_id uuid references persons(id),

 type text not null,
 category text not null,

 start_date date,
 end_date date,

 matured boolean default false,

 withdrawal boolean default false,

 withdrawal_date date,

 withdrawal_by text,

 withdrawal_payment_mode text,

 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
```

---

# Table: payments

Use decimal precision.

Never use float.

```sql
create table payments (
 id uuid primary key default gen_random_uuid(),

 chit_id uuid references chits(id),

 installment_no integer not null,

 expected_amount numeric(12,2),

 maturity_amount numeric(12,2),

 paid_date date,

 payment_mode text,

 paid_to text,

 advance_amount_paid numeric(12,2),

 status text,

 created_at timestamptz default now(),
 updated_at timestamptz default now()
);
```

---

# Business Rules

When a chit is created:

System automatically creates **20 installments**.

Never allow manual installment creation.

---

# Payment Configuration

## ONE_LAKH

```ts
export const ONE_LAKH = {
  payments: [
    5000,
    4000,
    4060,
    4120,
    4180,
    4240,
    4300,
    4360,
    4420,
    4480,
    4540,
    4600,
    4650,
    4700,
    4750,
    4800,
    4850,
    4900,
    4950,
    3000
  ],

  maturity: [
    73800,
    75000,
    76200,
    77400,
    78600,
    79800,
    81000,
    82200,
    83400,
    84600,
    85800,
    87000,
    88000,
    89000,
    90000,
    91000,
    92000,
    93000,
    94000,
    95000
  ]
}
```

---

## TWO_LAKH

```ts
export const TWO_LAKH = {
  payments: [
    5000,
    4267.5,
    4310,
    4352.5,
    4395,
    4437.5,
    4480,
    4522.5,
    4565,
    4607.5,
    4647.5,
    4687.5,
    4727.5,
    4767.5,
    4807.5,
    4847.5,
    4887.5,
    4925,
    4962.5,
    3950
  ],

  maturity: [
    81500,
    82350,
    83200,
    84050,
    84900,
    85750,
    86600,
    87450,
    88300,
    89150,
    89950,
    90750,
    91550,
    92350,
    93150,
    93950,
    94750,
    95500,
    96250,
    97000
  ]
}
```

---

# Screens

---

# Dashboard

Build a premium dashboard.

Widgets:

- Total Active Chits
- Pending Collections
- Monthly Revenue
- Matured Chits
- Overdue Accounts

Add:

- Revenue chart
- Payment trends
- Recent activities

---

# Person Module

Features:

- Search
- Filter
- Add person
- Edit person
- Delete person

Use:

- Search bar
- Empty states
- Skeleton loaders

---

# Chit Details

Show:

- Person info
- Chit info
- Timeline
- Progress ring
- Payment schedule

Payment schedule should look like a premium ledger.

---

# Payment Module

Allow:

- Mark paid
- Partial payment
- Advance payment

Show:

- Payment history
- Timeline
- Status badges

---

# Withdrawal Module

Capture:

- Withdrawal date
- Taken by
- Payment mode
- Proof upload

Store proofs in Supabase storage.

---

# Reports Module

Build:

## Reports

- Monthly collections
- Defaulters
- Matured members
- Upcoming withdrawals

Export:

- CSV
- PDF

---

# Components

Build reusable components:

## Cards

- KPI Card
- Stats Card
- Activity Card

## Tables

- Responsive table
- Mobile card table

## Charts

- Revenue chart
- Payment chart

## Feedback

- Toasts
- Confirmation modal
- Error states
- Empty states

---

# Performance

Implement:

- Pagination
- Infinite scrolling
- Lazy loading
- Skeletons
- Optimistic updates

---

# Testing

Write tests for:

- Form validation
- Chit creation
- Payment generation
- Decimal calculations
- Role permissions

Target:

```txt
80%+ coverage
```

---

# Deliverables

Generate:

1. Project setup
2. Database migrations
3. TypeScript types
4. Reusable components
5. Hooks
6. Test suite
7. Deployment config

---

# Build Order

Strictly follow:

Phase 1:

- Authentication
- Layout
- Theme system

Phase 2:

- Person module

Phase 3:

- Chit creation
- Auto installments

Phase 4:

- Payments

Phase 5:

- Withdrawals

Phase 6:

- Reports

Phase 7:

- Testing
- Optimization
- Deployment

Start now.