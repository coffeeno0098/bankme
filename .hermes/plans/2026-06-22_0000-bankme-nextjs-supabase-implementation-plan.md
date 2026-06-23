# BankMe Next.js + Supabase Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build a small personal income/expense tracker named BankMe using Next.js + Supabase, with Magic Link auth, user-scoped data, expense categories, monthly dashboard summaries, charts, and a settings page.

**Architecture:** Next.js App Router handles UI and server/client boundaries. Supabase provides PostgreSQL, Auth, Row Level Security, and typed database access. The app stores all financial records in one `transactions` table differentiated by `type`, with flat soft-deletable expense categories.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS/SSR, PostgreSQL, Recharts, Zod, React Hook Form, Vitest + React Testing Library, Playwright.

---

## Current Context / Decisions

Source of truth: `CONTEXT.md`

Key decisions already made:

- Single `transactions` table, not separate income/expense tables.
- `transactions.type` is either `income` or `expense`.
- Thai Baht only; no `currency` field in v1.
- Flat categories only; no nested categories.
- Categories are soft-deleted with `deleted_at`.
- Supabase Auth Magic Link.
- User-scoped RLS using `user_id = auth.uid()`.
- Dashboard default is monthly view.
- Dashboard includes summary cards, transaction list, filters, pie chart, and bar chart.
- Transaction creation/editing uses shadcn Dialog modal triggered from dashboard FAB/action button.
- Category management lives on `/settings`.
- First-time UX includes empty state + default categories.
- Amount must be positive, future dates are allowed, category names must be unique.
- Deploy to Vercel.

---

## Important Implementation Notes

### Do not implement everything in one pass

Use strict TDD for behavior-bearing code:

1. Write failing test.
2. Run only that test and confirm it fails for the expected reason.
3. Write minimal implementation.
4. Run the test again and confirm it passes.
5. Run relevant test group.
6. Refactor only after green.

### Suggested package manager

Use `npm` unless the project is initialized with another package manager. The initial project folder is currently empty except documentation files.

### Environment variables

Create `.env.local` during implementation, but never commit it.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Only use `SUPABASE_SERVICE_ROLE_KEY` in safe server-only scripts/routes, never client components.

---

## Proposed Database Schema

Create this in Supabase SQL Editor or via migration file later.

```sql
create type transaction_type as enum ('income', 'expense');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_name_not_empty check (length(trim(name)) > 0),
  constraint categories_unique_active_name unique (user_id, name)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type transaction_type not null,
  amount numeric(12, 2) not null,
  description text,
  transaction_at timestamptz not null,
  category_id uuid references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transactions_positive_amount check (amount > 0),
  constraint expense_requires_category check (
    (type = 'expense' and category_id is not null)
    or
    (type = 'income' and category_id is null)
  )
);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index categories_user_active_idx
  on public.categories(user_id, deleted_at);

create index transactions_user_transaction_at_idx
  on public.transactions(user_id, transaction_at desc);

create index transactions_user_type_idx
  on public.transactions(user_id, type);
```

### Schema tradeoff to revisit during implementation

`categories_unique_active_name unique (user_id, name)` prevents reusing a category name even after soft delete. If the user wants to delete `ของกิน` and later create `ของกิน` again, change to a partial unique index:

```sql
create unique index categories_unique_active_name_idx
  on public.categories(user_id, lower(name))
  where deleted_at is null;
```

Recommended: use the partial unique index instead of the table constraint if Supabase migration flow is used.

---

## Step-by-Step Plan

## Phase 1 — Project Setup

### Task 1: Initialize Next.js project

**Objective:** Create a TypeScript Next.js App Router project in `C:\Users\coffe\bankme` without overwriting `CONTEXT.md`.

**Files:**

- Create: `package.json`
- Create: `app/`
- Create: `public/`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Preserve: `CONTEXT.md`

**Command:**

```bash
cd /c/Users/coffe/bankme
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir false --import-alias "@/*"
```

**Verification:**

```bash
npm run lint
npm run dev
```

Expected:

- `npm run lint` passes.
- `npm run dev` starts Next.js locally.
- `CONTEXT.md` still exists.

---

### Task 2: Install application dependencies

**Objective:** Add Supabase, forms, validation, charts, date utilities, and testing dependencies.

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`

**Command:**

```bash
npm install @supabase/supabase-js @supabase/ssr recharts zod react-hook-form @hookform/resolvers date-fns clsx tailwind-merge lucide-react
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

**Verification:**

```bash
npm install
npm run lint
```

Expected: install completes and lint still passes.

---

### Task 3: Initialize shadcn/ui

**Objective:** Configure shadcn/ui for reusable UI components.

**Files:**

- Create: `components.json`
- Create: `lib/utils.ts`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts` or equivalent Tailwind config

**Command:**

```bash
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select table tabs calendar popover form dropdown-menu badge separator toast
```

**Verification:**

```bash
npm run lint
npm run dev
```

Expected: shadcn components compile and the dev server starts.

---

## Phase 2 — Testing Foundation

### Task 4: Configure Vitest

**Objective:** Add unit/component test runner.

**Files:**

- Create: `vitest.config.ts`
- Create: `test/setup.ts`
- Modify: `package.json`

**Add scripts:**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Verification:**

Create a temporary smoke test or keep a real test from Task 5.

Run:

```bash
npm run test
```

Expected: Vitest runs successfully.

---

### Task 5: Add test helpers for money/date calculations

**Objective:** Establish TDD target for pure business logic before UI.

**Files:**

- Create: `lib/finance.ts`
- Create: `lib/finance.test.ts`

**RED tests to write first:**

- `calculateMonthlySummary returns income, expense, and balance for selected month`
- `calculateMonthlySummary ignores transactions outside selected month`
- `groupExpensesByCategory groups only expenses`
- `buildIncomeExpenseTrend returns last six months in chronological order`

**Verification:**

```bash
npm run test -- lib/finance.test.ts
```

Expected RED first, then GREEN after implementation.

---

## Phase 3 — Supabase Setup

### Task 6: Create Supabase project manually

**Objective:** Set up hosted Supabase project and capture credentials.

**Manual steps:**

1. Go to Supabase dashboard.
2. Create project named `bankme`.
3. Enable Email Magic Link auth.
4. Copy Project URL and anon key.
5. Create `.env.local`.

**Files:**

- Create: `.env.local` (do not commit)
- Modify: `.gitignore` if needed

**Verification:**

`.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Expected: `.env.local` is ignored by git.

---

### Task 7: Add database migration SQL

**Objective:** Document schema in repo even if applied via Supabase dashboard.

**Files:**

- Create: `supabase/migrations/0001_initial_schema.sql`

**Content:**

Use the schema from “Proposed Database Schema”, preferably with partial unique index for active category names.

**Verification:**

Apply SQL in Supabase SQL Editor.

Expected:

- `categories` table exists.
- `transactions` table exists.
- RLS is enabled.
- Policies exist.
- Constraints reject invalid rows.

---

### Task 8: Generate or write database TypeScript types

**Objective:** Ensure Supabase queries are typed.

**Files:**

- Create: `lib/database.types.ts`

**Options:**

Preferred if Supabase CLI is available:

```bash
npx supabase gen types typescript --project-id <project-id> > lib/database.types.ts
```

Fallback:

- Write minimal `Database` type manually for `categories`, `transactions`, and enum `transaction_type`.

**Verification:**

```bash
npm run lint
```

Expected: TypeScript recognizes Supabase table names and row types.

---

### Task 9: Add Supabase client helpers

**Objective:** Create server/browser clients using `@supabase/ssr`.

**Files:**

- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `middleware.ts`

**Behavior:**

- Browser client for client components.
- Server client reads cookies.
- Middleware refreshes auth session.

**Verification:**

```bash
npm run lint
```

Expected: no type or lint errors.

---

## Phase 4 — Authentication

### Task 10: Build login page with Magic Link

**Objective:** Let the user enter email and request Magic Link.

**Files:**

- Create: `app/login/page.tsx`
- Create: `components/auth/login-form.tsx`
- Create: `components/auth/login-form.test.tsx`

**RED tests:**

- Login form renders email input and submit button.
- Invalid email shows validation error.
- Valid email calls Supabase `signInWithOtp`.

**Verification:**

```bash
npm run test -- components/auth/login-form.test.tsx
npm run lint
```

---

### Task 11: Protect app routes

**Objective:** Redirect unauthenticated users to `/login`.

**Files:**

- Modify: `middleware.ts`
- Create: `app/(app)/layout.tsx`
- Move dashboard routes under `app/(app)/`

**Behavior:**

- `/login` is public.
- Dashboard/settings require session.
- Authenticated users visiting `/login` can be redirected to `/`.

**Verification:**

Manual:

- Visit `/` logged out → redirects to `/login`.
- Complete Magic Link login → can access `/`.

---

## Phase 5 — Data Access Layer

### Task 12: Add category data functions

**Objective:** Encapsulate category CRUD and soft delete.

**Files:**

- Create: `lib/categories.ts`
- Create: `lib/categories.test.ts`

**Functions:**

```ts
listActiveCategories(userId: string)
createCategory(input: { userId: string; name: string })
renameCategory(input: { userId: string; id: string; name: string })
softDeleteCategory(input: { userId: string; id: string })
seedDefaultCategories(userId: string)
```

**RED tests:**

- `seedDefaultCategories creates five Thai default categories when none exist`
- `seedDefaultCategories does not duplicate existing categories`
- `softDeleteCategory sets deleted_at instead of deleting row`
- `listActiveCategories excludes soft-deleted categories`

**Verification:**

```bash
npm run test -- lib/categories.test.ts
```

---

### Task 13: Add transaction data functions

**Objective:** Encapsulate transaction CRUD and monthly queries.

**Files:**

- Create: `lib/transactions.ts`
- Create: `lib/transactions.test.ts`

**Functions:**

```ts
listTransactionsForMonth(input: { userId: string; month: Date; type?: 'income' | 'expense'; categoryId?: string })
createTransaction(input: CreateTransactionInput)
updateTransaction(input: UpdateTransactionInput)
deleteTransaction(input: { userId: string; id: string })
```

**Validation rules:**

- amount > 0
- future dates allowed
- income must have `categoryId = null`
- expense must have category
- description optional

**RED tests:**

- `createTransaction rejects zero or negative amount`
- `createTransaction allows future transaction_at`
- `createTransaction requires category for expense`
- `createTransaction rejects category for income`
- `listTransactionsForMonth filters by month and sorts newest first`

**Verification:**

```bash
npm run test -- lib/transactions.test.ts
```

---

## Phase 6 — Layout and Navigation

### Task 14: Build app shell

**Objective:** Add shared layout with navigation.

**Files:**

- Create: `components/app-shell.tsx`
- Create: `components/user-menu.tsx`
- Modify: `app/(app)/layout.tsx`

**UI:**

- App name: BankMe
- Nav links: Dashboard, Settings
- User menu: email + logout
- Responsive basic layout using Tailwind `md:` breakpoints

**Verification:**

```bash
npm run lint
```

Manual:

- Navigation renders on desktop and mobile width.

---

## Phase 7 — Dashboard

### Task 15: Build monthly state utilities

**Objective:** Centralize month/year logic.

**Files:**

- Create: `lib/month.ts`
- Create: `lib/month.test.ts`

**Functions:**

```ts
getMonthRange(month: Date): { start: Date; end: Date }
formatMonthLabel(month: Date): string
shiftMonth(month: Date, offset: number): Date
```

**RED tests:**

- start is first day of month at 00:00
- end is first day of next month
- shift handles year boundaries

**Verification:**

```bash
npm run test -- lib/month.test.ts
```

---

### Task 16: Build summary cards

**Objective:** Display income total, expense total, and balance.

**Files:**

- Create: `components/dashboard/summary-cards.tsx`
- Create: `components/dashboard/summary-cards.test.tsx`

**RED tests:**

- renders income total in THB format
- renders expense total in THB format
- renders positive/negative balance clearly

**Verification:**

```bash
npm run test -- components/dashboard/summary-cards.test.tsx
```

---

### Task 17: Build transaction list table

**Objective:** Show selected month transactions newest first.

**Files:**

- Create: `components/transactions/transaction-table.tsx`
- Create: `components/transactions/transaction-table.test.tsx`

**Columns:**

- Date/time
- Type
- Amount
- Category
- Description
- Actions

**RED tests:**

- shows empty state when list is empty
- renders transactions newest first
- income category cell is blank or `-`
- expense shows category name

**Verification:**

```bash
npm run test -- components/transactions/transaction-table.test.tsx
```

---

### Task 18: Build dashboard charts

**Objective:** Add pie chart and bar chart using Recharts.

**Files:**

- Create: `components/dashboard/expense-pie-chart.tsx`
- Create: `components/dashboard/income-expense-bar-chart.tsx`
- Create: `components/dashboard/charts.test.tsx`

**Behavior:**

- Pie chart groups expense totals by category for selected month.
- Bar chart shows income vs expense for last 3–6 months.
- Empty data shows friendly placeholder.

**RED tests:**

- pie chart receives grouped category totals
- bar chart renders month labels in chronological order
- empty chart shows placeholder text

**Verification:**

```bash
npm run test -- components/dashboard/charts.test.tsx
```

---

### Task 19: Compose dashboard page

**Objective:** Wire server data + dashboard UI.

**Files:**

- Create/Modify: `app/(app)/page.tsx`
- Create: `components/dashboard/month-picker.tsx`
- Create: `components/dashboard/dashboard-filters.tsx`

**Behavior:**

- Month/year picker controls selected month via URL search params.
- Filters by type/category via URL search params.
- Summary cards, charts, and table update from selected filters.

**Verification:**

```bash
npm run lint
npm run test
```

Manual:

- Change month → data changes.
- Filter expense/category → table changes.
- Empty month shows empty state.

---

## Phase 8 — Transaction Dialog

### Task 20: Build transaction validation schema

**Objective:** Validate form inputs before writing to Supabase.

**Files:**

- Create: `lib/validation/transaction.ts`
- Create: `lib/validation/transaction.test.ts`

**Schema:**

- `type`: `income` or `expense`
- `amount`: positive number
- `transaction_at`: valid date/time
- `description`: optional string
- `category_id`: required for expense, null for income

**RED tests:**

- zero amount fails
- negative amount fails
- future date passes
- expense without category fails
- income with category fails

**Verification:**

```bash
npm run test -- lib/validation/transaction.test.ts
```

---

### Task 21: Build add transaction dialog

**Objective:** Create modal form for adding income/expense.

**Files:**

- Create: `components/transactions/transaction-dialog.tsx`
- Create: `components/transactions/transaction-dialog.test.tsx`

**UI:**

- Type selector
- Amount input
- Date/time input
- Category select only for expense
- Optional description textarea/input
- Submit button

**RED tests:**

- clicking add opens dialog
- selecting income hides category select
- selecting expense shows required category select
- submitting valid expense calls create action
- validation errors appear inline

**Verification:**

```bash
npm run test -- components/transactions/transaction-dialog.test.tsx
```

---

### Task 22: Add transaction server action

**Objective:** Persist transaction and refresh dashboard.

**Files:**

- Create: `app/(app)/actions/transactions.ts`
- Modify: `components/transactions/transaction-dialog.tsx`

**Behavior:**

- Reads authenticated user from Supabase server client.
- Validates input with Zod.
- Inserts into `transactions`.
- Revalidates dashboard route.
- Shows toast success/error.

**Verification:**

```bash
npm run lint
npm run test
```

Manual:

- Add income → appears in table and summary income increases.
- Add expense → appears in table, pie chart, and summary expense increases.

---

## Phase 9 — Settings / Category Management

### Task 23: Build category validation schema

**Objective:** Validate category names consistently.

**Files:**

- Create: `lib/validation/category.ts`
- Create: `lib/validation/category.test.ts`

**Rules:**

- name is required
- trimmed name must not be empty
- duplicate active names rejected by DB and surfaced nicely in UI

**RED tests:**

- empty name fails
- whitespace-only name fails
- valid Thai name passes

**Verification:**

```bash
npm run test -- lib/validation/category.test.ts
```

---

### Task 24: Build settings page category table

**Objective:** Let user view/add/rename/soft-delete categories.

**Files:**

- Create: `app/(app)/settings/page.tsx`
- Create: `components/settings/category-table.tsx`
- Create: `components/settings/category-table.test.tsx`
- Create: `app/(app)/actions/categories.ts`

**Behavior:**

- Shows active categories only.
- Add category.
- Rename category.
- Soft-delete category.
- Duplicate category name shows friendly error.

**RED tests:**

- table renders categories
- empty categories show empty state
- add form validates required name
- delete button calls soft-delete action

**Verification:**

```bash
npm run test -- components/settings/category-table.test.tsx
npm run lint
```

Manual:

- Add category → appears in list and transaction dialog.
- Delete category → disappears from settings and transaction dialog.
- Old transactions keep their old category relation.

---

### Task 25: Seed default categories for first-time users

**Objective:** Create default categories automatically after first login.

**Files:**

- Modify: `app/(app)/layout.tsx` or create `lib/onboarding.ts`
- Create: `lib/onboarding.test.ts`

**Default categories:**

- ของกิน
- เครื่องดื่ม
- ค่าเดินทาง
- ที่พัก
- ช้อปปิ้ง

**Behavior:**

- Runs after authenticated session is available.
- Creates missing defaults only once/idempotently.
- Does not recreate soft-deleted categories unless explicitly desired later.

**RED tests:**

- new user gets five categories
- existing user does not get duplicates

**Verification:**

```bash
npm run test -- lib/onboarding.test.ts
```

Manual:

- New account login → settings has five default categories.

---

## Phase 10 — Empty States and UX Polish

### Task 26: Add dashboard empty states

**Objective:** Make first-time dashboard useful and friendly.

**Files:**

- Create: `components/dashboard/empty-dashboard-state.tsx`
- Modify: `app/(app)/page.tsx`

**Behavior:**

- If no transactions in selected month, show CTA: “ยังไม่มีรายการ — เพิ่มรายการแรกเลย”
- Charts show placeholders, not broken blank boxes.

**Verification:**

```bash
npm run lint
npm run test
```

Manual:

- Fresh user sees CTA and default categories exist.

---

### Task 27: Add THB formatting helper

**Objective:** Format all money values consistently.

**Files:**

- Create: `lib/format.ts`
- Create: `lib/format.test.ts`

**Function:**

```ts
formatTHB(amount: number): string
```

**RED tests:**

- `1000` formats as Thai Baht currency
- decimals are shown correctly
- negative balance formats clearly

**Verification:**

```bash
npm run test -- lib/format.test.ts
```

---

## Phase 11 — End-to-End Validation

### Task 28: Configure Playwright

**Objective:** Add basic E2E coverage for core flows.

**Files:**

- Create: `playwright.config.ts`
- Create: `e2e/bankme.spec.ts`
- Modify: `package.json`

**Add script:**

```json
{
  "scripts": {
    "test:e2e": "playwright test"
  }
}
```

**Flows:**

- Logged-out user sees login page.
- Authenticated user sees dashboard.
- User can add category.
- User can add expense.
- Dashboard summary updates.

**Note:** Supabase Magic Link is hard to automate. For E2E, use either:

- a test user session cookie helper, or
- Supabase local/testing setup, or
- mock auth only for E2E environment.

**Verification:**

```bash
npm run test:e2e
```

Expected: critical user flow passes.

---

### Task 29: Run full quality gates

**Objective:** Confirm the app is ready for deployment.

**Commands:**

```bash
npm run lint
npm run test
npm run build
```

Expected:

- lint passes
- tests pass
- production build succeeds

---

## Phase 12 — GitHub + Vercel Deployment

### Task 30: Prepare repository

**Objective:** Make repo ready for GitHub/Vercel.

**Files:**

- Create: `README.md`
- Confirm: `.gitignore` includes `.env.local`
- Keep: `CONTEXT.md`
- Keep: `.hermes/plans/...`

**README should include:**

- Project overview
- Tech stack
- Local setup
- Environment variables
- Supabase schema setup
- Test commands

**Verification:**

```bash
git status
npm run build
```

Expected: no secrets staged.

---

### Task 31: Deploy to Vercel

**Objective:** Publish app using Vercel free tier.

**Manual steps:**

1. Push repo to GitHub.
2. Import project in Vercel.
3. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Set Supabase Auth redirect URLs:
   - local: `http://localhost:3000/auth/callback`
   - production: `https://<vercel-domain>/auth/callback`
5. Deploy.

**Verification:**

- Open production URL.
- Request Magic Link.
- Login succeeds.
- Add income.
- Add expense.
- Dashboard summary/charts update.

---

## Files Likely to Exist After Implementation

```text
bankme/
├── CONTEXT.md
├── README.md
├── app/
│   ├── (app)/
│   │   ├── actions/
│   │   │   ├── categories.ts
│   │   │   └── transactions.ts
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── login/
│       └── page.tsx
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── settings/
│   ├── transactions/
│   └── ui/
├── e2e/
│   └── bankme.spec.ts
├── lib/
│   ├── categories.ts
│   ├── database.types.ts
│   ├── finance.ts
│   ├── format.ts
│   ├── month.ts
│   ├── onboarding.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── transactions.ts
│   └── validation/
│       ├── category.ts
│       └── transaction.ts
├── middleware.ts
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql
├── test/
│   └── setup.ts
├── vitest.config.ts
└── playwright.config.ts
```

---

## Risks / Tradeoffs / Open Questions

### 1. Soft delete + unique category names

Decision needed during implementation:

- Should a user be allowed to recreate a soft-deleted category with the same name?

Recommendation: yes, use partial unique index on active categories only.

### 2. Timezone handling

`transaction_at` is `timestamptz`. Monthly filtering must consistently use the user’s local timezone or Thailand timezone.

Recommendation for v1: treat displayed/selected months using local browser timezone. If unexpected month-boundary behavior appears, standardize to `Asia/Bangkok` later.

### 3. Magic Link E2E testing

Automating real email login is inconvenient.

Recommendation: keep unit/component tests strong, then use a test-session helper or manual smoke test for auth.

### 4. Supabase local vs hosted

Hosted Supabase is fastest for this personal project. Local Supabase gives better automated integration tests but adds Docker/setup complexity.

Recommendation: hosted Supabase first; add local Supabase only if testing friction becomes a problem.

---

## Definition of Done

The project is done when:

- User can login with Supabase Magic Link.
- First login seeds five default categories.
- User can add income.
- User can add expense with category.
- User can view monthly summary: income, expense, balance.
- User can filter transactions by type/category.
- User can see pie chart by expense category.
- User can see bar chart for income vs expense trend.
- User can manage categories in `/settings`.
- Deleted categories are soft-deleted and hidden from active selectors.
- Amount validation rejects zero/negative values.
- Future transaction dates are accepted.
- `npm run lint`, `npm run test`, and `npm run build` pass.
- App is deployed on Vercel and can login successfully in production.

---

## Recommended Implementation Order

1. Project setup
2. Testing setup
3. Supabase schema
4. Supabase clients + auth
5. Data access functions
6. Dashboard pure calculation tests
7. Dashboard UI
8. Transaction dialog
9. Settings/category CRUD
10. Empty states/onboarding
11. E2E smoke tests
12. Vercel deployment

Do not skip the quality gates after each phase.

---

## Handoff

Plan complete. Implementation should proceed task-by-task with TDD and frequent verification. Do not start coding until the user explicitly says to implement.
