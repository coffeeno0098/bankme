# BankMe — System Architecture

> **BankMe** — แอปบันทึกรายรับรายจ่ายส่วนตัว (Personal Finance Tracker)
> 
> อัปเดตล่าสุด: 25 มิถุนายน 2569

---

## 🧱 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router + Turbopack) | 16.2.9 |
| UI Library | React | 19.2.4 |
| UI Components | shadcn/ui (base-ui) | ^1.6.0 |
| Styling | Tailwind CSS | ^4 |
| Charts | Recharts | ^3.8.1 |
| Forms | react-hook-form + zod | ^7.80 / ^4.4 |
| Icons | Lucide React | ^1.21 |
| Database | Supabase (PostgreSQL) | Cloud |
| Auth | Supabase Auth (Email + Password) | `@supabase/ssr` ^0.12 |
| Deployment | Vercel | Production |
| Testing | Vitest + Playwright | ^4.1 / ^1.61 |
| Language | TypeScript | ^5 |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Login    │  │ Sign Up  │  │ Dashboard Client  │  │
│  │ Form     │  │ Form     │  │ (charts, table,   │  │
│  │          │  │          │  │  filters, dialog) │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│                                                       │
│  supabase.auth.signInWithPassword / signUp            │
│         ↓                                             │
│  Supabase JS Client (Browser)                         │
│  └─ session cookie → localStorage                     │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────┐
│                    Vercel (Edge)                     │
│                                                       │
│  ┌──────────────────────────────────────┐            │
│  │  proxy.ts (Next.js Middleware)       │            │
│  │  ─ on every request                  │            │
│  │  ─ getSession() → auto-refresh JWT   │            │
│  │  ─ Guard: /login|/auth → public     │            │
│  │  ─ Guard: /* → session required     │            │
│  └──────────────────────────────────────┘            │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────────────────────┐            │
│  │  Next.js Server Components / Actions │            │
│  │  ─ SSR pages (dashboard, settings)   │            │
│  │  ─ Server Actions (CRUD)             │            │
│  │  ─ getSession() guard per-layout     │            │
│  └──────────────────────────────────────┘            │
└─────────────────────────────────────────────────────┘
                        │
                        │ Supabase API
                        ▼
┌─────────────────────────────────────────────────────┐
│              Supabase Cloud (PostgreSQL)              │
│                                                       │
│  ┌──────────────┐   ┌──────────────────┐             │
│  │ auth.users   │   │ public.categories │             │
│  │ ─ email      │   │ ─ id, user_id    │             │
│  │ ─ password   │   │ ─ name           │             │
│  │ ─ JWT token  │   │ ─ deleted_at      │             │
│  └──────────────┘   └──────────────────┘             │
│                     ┌──────────────────┐             │
│                     │ public.transactions│            │
│                     │ ─ id, user_id    │             │
│                     │ ─ type (enum)     │             │
│                     │ ─ amount (numeric)│             │
│                     │ ─ category_id (FK)│             │
│                     │ ─ transaction_at  │             │
│                     └──────────────────┘             │
│                                                       │
│  RLS: ทุก query มี user_id = auth.uid()              │
└─────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
bankme/
├── src/
│   ├── app/                         # Next.js App Router
│   │   ├── layout.tsx               # Root layout (Geist font, Thai lang)
│   │   ├── globals.css              # Tailwind + shadcn theme
│   │   ├── login/
│   │   │   └── page.tsx             # Login/SignUp tabs (client component)
│   │   ├── auth/
│   │   │   └── callback/route.ts    # Auth callback (email verification)
│   │   └── (app)/                   # Route group — protected
│   │       ├── layout.tsx           # Auth guard: getSession() → redirect /login
│   │       ├── page.tsx             # Dashboard (server component)
│   │       ├── dashboard-client.tsx # Dashboard client shell
│   │       ├── settings/
│   │       │   └── page.tsx         # Category management
│   │       └── actions/
│   │           ├── transactions.ts  # Server Action: createTransaction
│   │           └── categories.ts    # Server Action: CRUD categories
│   │
│   ├── proxy.ts                     # Middleware: session refresh + auth guard
│   │
│   ├── components/
│   │   ├── auth/
│   │   │   ├── login-form.tsx       # Email + Password + Remember Me
│   │   │   └── signup-form.tsx      # Email + Password + Confirm
│   │   ├── dashboard/
│   │   │   ├── summary-cards.tsx    # Income/Expense/Balance cards
│   │   │   ├── expense-pie-chart.tsx # Pie chart (Recharts)
│   │   │   ├── income-expense-bar-chart.tsx # Trend bar chart
│   │   │   ├── month-picker.tsx     # Month selector
│   │   │   ├── dashboard-filters.tsx # Type, Category, Month filters & Search
│   │   │   └── empty-dashboard-state.tsx # Empty state onboarding
│   │   ├── transactions/
│   │   │   ├── transaction-table.tsx # Date-grouped list with pagination
│   │   │   └── transaction-dialog.tsx # Add/Edit dialog
│   │   ├── settings/
│   │   │   └── category-table.tsx   # Category CRUD table
│   │   ├── app-shell.tsx            # App layout shell (sidebar/header + UserMenu)
│   │   └── ui/                      # shadcn/ui components
│   │       ├── {button,card,input,label,select,table}.tsx
│   │       ├── {dialog,popover,dropdown-menu,tabs,separator}.tsx
│   │       ├── {badge,calendar,sonner,checkbox}.tsx
│   │
│   └── lib/
│       ├── supabase/
│       │   ├── client.ts            # Browser Supabase client
│       │   └── server.ts            # Server Supabase client (SSR cookies)
│       ├── database.types.ts        # TypeScript types for DB schema
│       ├── finance.ts               # Core: calculateMonthlySummary, groupExpensesByCategory, buildIncomeExpenseTrend
│       ├── categories.ts            # Category queries + seed
│       ├── transactions.ts          # Transaction queries (list, create, update, delete)
│       ├── month.ts                 # Month utilities (getMonthRange, format, shift)
│       ├── format.ts                # Currency formatting (THB)
│       ├── onboarding.ts            # Seed default categories on first login
│       ├── finance.test.ts          # Unit tests (9 tests)
│       └── validation/
│           ├── transaction.ts       # Zod schema: expense requires category, income doesn't
│           └── category.ts          # Zod schema: name validation
│
├── supabase/
│   └── migrations/
│       └── 0001_initial_schema.sql  # Full DB schema: tables, RLS, indexes, triggers
│
├── .env.local                       # NEXT_PUBLIC_SUPABASE_URL, ANON_KEY
├── package.json
└── tsconfig.json
```

---

## 🔐 Authentication Flow

### 1. Sign Up
```
User → SignupForm → supabase.auth.signUp(email, password)
  → Supabase sends confirmation email
  → User clicks link → /auth/callback?code=... → exchangeCodeForSession(code)
  → Session cookie set → redirect to /
```

### 2. Sign In
```
User → LoginForm → supabase.auth.signInWithPassword(email, password)
  → Session cookie set in browser (localStorage + cookies)
  → router.push("/") → proxy.ts → getSession() → session found → pass
  → (app)/layout.tsx → getSession() → session found → render dashboard
```

### 3. Session Refresh
```
Every request → proxy.ts → getSession() 
  → if JWT < 1 hour: returns cached session
  → if JWT near expiry: auto-refresh with Supabase, set new cookies
  → Browser receives refreshed cookies
```

### 4. Remember Me
```
LoginForm:
  ☑️ "จดจำฉันไว้" → email saved to localStorage
  → On next visit: email pre-filled, checkbox checked
  → Session persists via Supabase auto-refresh
```

---

## 🗄️ Database Schema

### Table: `public.categories`
| Column | Type | Constraint |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| user_id | UUID (FK → auth.users) | NOT NULL, ON DELETE CASCADE |
| name | TEXT | NOT NULL, CHECK(length(trim(name)) > 0) |
| deleted_at | TIMESTAMPTZ | Soft delete |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT now() |
| updated_at | TIMESTAMPTZ | NOT NULL, auto-update trigger |

**Unique Index:** `(user_id, LOWER(name)) WHERE deleted_at IS NULL`

### Table: `public.transactions`
| Column | Type | Constraint |
|---|---|---|
| id | UUID (PK) | gen_random_uuid() |
| user_id | UUID (FK → auth.users) | NOT NULL, ON DELETE CASCADE |
| type | ENUM('income','expense') | NOT NULL |
| amount | NUMERIC(12,2) | NOT NULL, CHECK(amount > 0) |
| description | TEXT | NULLABLE |
| transaction_at | TIMESTAMPTZ | NOT NULL |
| category_id | UUID (FK → categories) | ON DELETE RESTRICT |
| created_at | TIMESTAMPTZ | NOT NULL |
| updated_at | TIMESTAMPTZ | auto-update trigger |

**Business Rules (enforced at DB level):**
- `expense` → `category_id` MUST NOT NULL
- `income` → `category_id` MUST BE NULL
- These rules are also validated in Zod on the client side

### RLS Policies (Row Level Security)
ทุก table มี RLS ON — ผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง:
```sql
-- Example: categories
CREATE POLICY "categories_select_own" ON categories FOR SELECT
  USING (auth.uid() = user_id);
-- Same pattern for INSERT, UPDATE, DELETE
-- Same pattern for transactions
```

---

## 📊 Core Business Logic

### `lib/finance.ts` — Pure Functions (Unit Tested)
```
calculateMonthlySummary(transactions, month) → { totalIncome, totalExpense, balance }
  ─ Sums income & expense for a given month
  ─ Returns rounded to 2 decimals

groupExpensesByCategory(transactions) → CategoryGroup[]
  ─ Groups expenses by category_name
  ─ Sorted by total descending
  ─ Uncategorized → "ไม่มีหมวดหมู่"

buildIncomeExpenseTrend(transactions, refDate, 6 months) → TrendPoint[]
  ─ Builds last 6 months of income/expense data
  ─ Fills in actual data from transactions
  ─ Empty months remain {income: 0, expense: 0}
```

### `lib/categories.ts` — Server-Side Queries
```
listActiveCategories()          → query: WHERE deleted_at IS NULL
createCategory(name)            → INSERT + unique constraint handling
renameCategory(id, name)        → UPDATE + owner check
softDeleteCategory(id)          → UPDATE deleted_at = now()
seedDefaultCategories()         → Creates 5 default categories on first login
  ─ ของกิน, เครื่องดื่ม, ค่าเดินทาง, ที่พัก, ช้อปปิ้ง
```

### `lib/transactions.ts` — Server-Side Queries
```
listTransactionsForMonth(date)  → SELECT with JOIN categories, filtered by month
createTransaction(input)        → INSERT with user_id
updateTransaction(input)        → UPDATE with owner check
deleteTransaction(id)           → DELETE with owner check
```

---

## 🎨 UI Components

### Pages
| Route | Component | Type |
|---|---|---|
| `/login` | LoginForm / SignupForm (tabbed) | Client |
| `/` (dashboard) | DashboardPage → DashboardClient | Server → Client |
| `/settings` | SettingsPage → CategoryTable | Server → Client |

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│  MonthPicker ← → [เพิ่มรายการ]          │
├─────────────────────────────────────────┤
│  SummaryCards (รายรับ | รายจ่าย | คงเหลือ) │
├─────────────────────────────────────────┤
│  DashboardFilters (type | category)     │
├─────────────────────────────────────────┤
│  TransactionTable (รายการทั้งหมด)        │
├──────────────────┬──────────────────────┤
│  ExpensePieChart │ IncomeExpenseBarChart │
└──────────────────┴──────────────────────┘
```

### Charts
- **ExpensePieChart** — Pie chart แสดงสัดส่วนรายจ่ายตามหมวดหมู่ (Recharts PieChart)
- **IncomeExpenseBarChart** — Bar chart เปรียบเทียบรายรับ-รายจ่าย 6 เดือนย้อนหลัง (Recharts BarChart)

---

## 🔄 Data Flow

### Creating a Transaction
```
1. User clicks [+ เพิ่มรายการ] → TransactionDialog opens
2. Form: type (income/expense), amount, date, category, description
3. Client-side validation: Zod (amount > 0, expense → category required)
4. Submit → Server Action: createTransaction(input)
5. Server: getSession() → get user_id → INSERT INTO transactions
6. revalidatePath("/") → Next.js re-fetches dashboard
7. Dashboard re-renders with new data
```

### Month Navigation
```
1. User clicks ← / → in MonthPicker
2. updateSearchParams({ month: "2026-05" })
3. router.push("?month=2026-05")
4. DashboardPage re-renders with new month
5. getMonthRange(selectedMonth) → queries transactions for that month
6. Recalculates: summary, pieData, trendData
```

### Filtering
```
1. User selects type: "expense" or category: "ของกิน"
2. updateSearchParams({ type: "expense", category: "ของกิน" })
3. URL updates: ?month=2026-06&type=expense&category=xxx
4. Server re-reads searchParams → filters query
5. Table + charts update
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```
src/lib/finance.test.ts — 9 tests
  ─ calculateMonthlySummary: correct income/expense/balance
  ─ groupExpensesByCategory: groups correctly, sorts descending
  ─ buildIncomeExpenseTrend: 6-month range, correct values
```

### E2E Tests (Playwright)
```
4 tests — basic navigation and auth flow
```

---

## 🚀 Deployment

### Vercel Configuration
- **Project:** `coffeeno/bankme`
- **Domain:** `bankme-eight.vercel.app`
- **Build:** `npm run build` (Next.js)
- **Env Vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Supabase Configuration
- **Project ID:** `ffqxayuqfxwejsnpvzxv`
- **Auth:** Email + Password (no email confirmation)
- **Site URL:** `https://bankme-eight.vercel.app`
- **Redirect URLs:** `https://bankme-eight.vercel.app/**`

### Deploy Flow
```
git push → Vercel auto-deploys (GitHub integration)
OR
npx vercel --prod (manual CLI deploy)
```

---

## 🔑 Key Design Principles

1. **Row Level Security (RLS) is the security boundary**
   — Every query implicitly filters by `user_id = auth.uid()`
   — ไม่ต้องพึ่ง `WHERE user_id = ?` ใน application code (แต่ก็ใส่ไว้ double-check)

2. **Server Components for data, Client Components for interactivity**
   — Dashboard page queries data on server → passes to client for rendering
   — Server Actions handle mutations → revalidatePath for cache invalidation

3. **Soft delete for categories**
   — `deleted_at` ไม่ใช่ `DELETE` — transactions ที่อ้างอิง category เก่าจะไม่พัง
   — `ON DELETE RESTRICT` on FK — prevents accidental hard delete

4. **Database-level constraints + Zod validation**
   — `expense_requires_category` CHECK constraint ใน DB
   — Zod schema validates same rules on client before submit
   — Defense in depth

5. **Session auto-refresh via proxy.ts**
   — `getSession()` ใน middleware refresh JWT อัตโนมัติ ไม่ต้องให้ user login ใหม่
   — `getSession()` ใน layout ตรวจ auth โดยไม่ต้องเรียก Supabase ซ้ำ

6. **Thai-first design**
   — UI ภาษาไทยทั้งหมด (labels, placeholders, error messages)
   — Currency format: THB (฿)
   — Date format: Thai locale ready

7. **URL-driven state**
   — Filters + month selection → URL search params
   — Shareable URLs, browser back/forward works
   — Server can read searchParams directly