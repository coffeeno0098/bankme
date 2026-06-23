# BankMe — Domain Context

Personal income & expense tracker, single-user web app.

## Glossary

| Term | Definition |
|------|------------|
| **Transaction** | A single financial record — either income (เงินเข้า) or expense (เงินออก). |
| **Income** | A transaction of type `income` — money received. Has no category. |
| **Expense** | A transaction of type `expense` — money spent. Must reference a Category (FK). |
| **Category** | A label for grouping expenses (e.g. "ของกิน", "ค่าเดินทาง"). Categories are flat (no nesting). Soft-deletable. |
| **Balance** | Total income minus total expenses within a given month. |

## Key Decisions

1. **Single `transactions` table** (not separate income/expense tables) — differentiated by a `type` field (`income` | `expense`).
2. **Flat categories** — no nesting; simple dropdown picker.
3. **Currency** — Thai Baht only; no multi-currency support.
4. **Soft delete on categories** — deleting a category sets `deleted_at`; existing transactions retain their `category_id`.
5. **Supabase Auth (Magic Link)** — single-user but uses Supabase Auth for security + RLS.

## Out of Scope (v1)

- Multi-user / shared accounts
- Budget planning or savings goals
- Export (PDF/CSV)
- Transaction editing history / audit log

## Dashboard

- **Default view**: Monthly — pick month/year, see summary (income total / expense total / balance) + transaction list (newest first).
- **Charts**: Pie chart (expense breakdown by category) + Bar chart (income vs expense, last 3–6 months). Both per selected month.
- **Filters**: By type (income/expense) and category.

## Tech Stack

- **Frontend**: Next.js (App Router)
- **Backend / DB**: Supabase (PostgreSQL + Auth)
- **Auth**: Supabase Magic Link
- **Charts**: Recharts (React-native charting library)
- **UI**: Tailwind CSS + shadcn/ui
- **Transaction Form**: Modal/Dialog (shadcn `<Dialog>`) triggered by FAB button on dashboard
- **Category Management**: Separate `/settings` page with CRUD table
- **Deployment**: Vercel (free tier, auto-deploy from GitHub)
- **RLS Policy**: User-scoped — every row has `user_id = auth.uid()`, policy filters by user
- **Mobile**: Functional but not mobile-first (Tailwind `md:` breakpoints, basic responsive)
- **First-time UX**: Empty state with CTA + 5 default categories pre-seeded (ของกิน, เครื่องดื่ม, ค่าเดินทาง, ที่พัก, ช้อปปิ้ง)
- **Validation**: Amount must be positive (> 0), future dates allowed, category names must be unique
