# 🏦 BankMe — บันทึกรายรับรายจ่ายส่วนตัว

แอปบันทึกรายรับรายจ่ายส่วนตัว สร้างด้วย Next.js + Supabase

## Features

- ✅ บันทึกรายรับ/รายจ่าย พร้อมหมวดหมู่
- ✅ Dashboard แสดงสรุปรายเดือน (ยอดรับ, ยอดจ่าย, คงเหลือ)
- ✅ Pie Chart แสดงสัดส่วนรายจ่ายตามหมวดหมู่
- ✅ Bar Chart เปรียบเทียบรายรับ vs รายจ่าย 6 เดือน
- ✅ จัดการหมวดหมู่ (เพิ่ม/แก้ไข/ลบ)
- ✅ Login ด้วย Magic Link (Supabase Auth)
- ✅ Responsive (ใช้ได้ทั้ง Desktop และ Mobile)
- ✅ สกุลเงินบาทไทย

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) |
| UI | Tailwind CSS 4 + shadcn/ui |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Magic Link |
| Validation | Zod + React Hook Form |
| Testing | Vitest + Playwright |
| Deploy | Vercel |

## Getting Started

### 1. Supabase Setup

1. สร้างโปรเจคที่ [supabase.com](https://supabase.com)
2. ไปที่ SQL Editor → รัน `supabase/migrations/0001_initial_schema.sql`
3. ไปที่ Settings → API → ก็อป `Project URL` และ `anon public` key

### 2. Environment

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

### 3. Run

```bash
npm install
npm run dev
```

เปิด http://localhost:3000

### 4. Auth Setup (Magic Link)

1. Supabase Dashboard → Authentication → Email Templates
2. เปลี่ยน `{{ .SiteURL }}` เป็น `http://localhost:3000` (local) หรือ `https://your-domain.vercel.app` (production)

## Testing

```bash
npm test          # Unit tests (Vitest)
npx playwright test  # E2E tests
```

## Project Structure

```
src/
├── app/
│   ├── (app)/          # Protected routes
│   │   ├── actions/    # Server actions
│   │   ├── settings/   # Category management
│   │   └── page.tsx    # Dashboard
│   ├── login/          # Auth page
│   └── layout.tsx      # Root layout
├── components/
│   ├── auth/           # Login form
│   ├── dashboard/      # Charts, filters, summary
│   ├── settings/       # Category table
│   ├── transactions/   # Transaction dialog & table
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── supabase/       # Server & browser clients
│   ├── finance.ts      # Business logic
│   ├── categories.ts   # Category CRUD
│   ├── transactions.ts # Transaction CRUD
│   └── validation/     # Zod schemas
└── middleware.ts       # Auth redirect
```

## License

Private project — for personal use.