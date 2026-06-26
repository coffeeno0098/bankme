# BankMe Full Visual Redesign

ดีไซน์เว็บ BankMe ใหม่ทั้งหมด — ใช้ Cal.com design language จาก [DESIGN-cal.md](file:///c:/Users/coffe/bankme/.skill/DESIGN-cal.md) ร่วมกับแนวทางจาก [frontend-design.md](file:///c:/Users/coffe/bankme/.skill/frontend-design.md) **ฟังก์ชันทั้งหมดยังคงเดิม 100%**

## Design Direction

### Subject & Audience
แอปบันทึกรายรับรายจ่ายส่วนตัว (Thai Baht) สำหรับ single user — ต้องการความรู้สึก **professional financial tool** ที่สะอาด ชัดเจน อ่านง่าย ไม่ยุ่งเหยิง

### Design Identity — Cal.com Adaptation for Finance

**ไม่ใช่ copy Cal.com** แต่ใช้ DNA เดียวกันให้เข้ากับ finance app:

| Axis | Cal.com Original | BankMe Adaptation |
|---|---|---|
| Canvas | White `#ffffff` | เหมือนเดิม — white canvas with light-gray cards |
| Primary CTA | Black `#111111` | เหมือนเดิม — near-black buttons |
| Display font | Cal Sans (custom) | **Manrope 600** with negative tracking (substitute ที่ skill แนะนำ) |
| Body font | Inter 400 | เหมือนเดิม |
| Signature | Product UI in-card | **Financial figures** ด้วย Manrope 700 tabular-nums เป็น hero element |
| Dark surface | Footer only | ไม่มี footer, ใช้ dark surface สำหรับ **balance card** เป็น featured element |
| Pill nav | ✅ | ✅ ใช้ pill-group สำหรับ nav + type filters |
| Color discipline | Monochrome + scarce blue | Monochrome + scarce `#10b981` income / `#ef4444` expense |

### Signature Element
**ตัวเลขเงินขนาดใหญ่** (Balance card) — ใช้ Manrope 700, -0.03em tracking, tabular-nums, font-size 36px บน dark surface card (`#101010`) เป็น hero element ที่ดึงสายตาทันที

### Color Palette (6 colors + semantic)

| Name | Hex | Use |
|---|---|---|
| Ink | `#111111` | Headlines, primary buttons |
| Body | `#374151` | Running text |
| Muted | `#6b7280` | Secondary text, labels |
| Canvas | `#ffffff` | Page background |
| Surface | `#f5f5f5` | Cards, containers |
| Hairline | `#e5e7eb` | Borders, dividers |
| Income green | `#10b981` | Income amounts, indicators |
| Expense red | `#ef4444` | Expense amounts, indicators |

### Dark Theme
เก็บ dark theme ไว้ โดย adapt Cal.com's dark surface colors:
- Background: `#0a0a0a`
- Card: `#171717`  
- Elevated card (balance): `#1a1a1a`

---

## User Review Required

> [!IMPORTANT]
> **Design scope**: ทำ visual redesign ล้วนๆ — CSS tokens, typography, spacing, border-radius, color, component styling — **ไม่เปลี่ยน logic, data flow, state management, หรือ API calls เลย**

> [!IMPORTANT]  
> **Cal Sans substitute**: ใช้ **Manrope** (ตาม skill แนะนำ — "Manrope at weight 700 is another close alternative") สำหรับ display headlines แทน Cal Sans ที่เป็น proprietary font

> [!WARNING]
> **Dark theme**: Cal.com spec เป็น light-only, แต่ BankMe มี dark theme อยู่แล้ว — จะ preserve dark theme โดย adapt Cal.com's dark surface colors (`#0a0a0a`, `#171717`, `#1a1a1a`)

---

## Proposed Changes

### Design System — globals.css
#### [MODIFY] [globals.css](file:///c:/Users/coffe/bankme/src/app/globals.css)

ปรับ CSS variables ทั้งหมดให้ตรง Cal.com design tokens:
- ปรับ border-radius scale: `sm=6px`, `md=8px`, `lg=12px`, `xl=16px`
- ปรับ chart colors ให้เข้ากับ monochrome palette + badge pastels
- ปรับ pill-group CSS ให้ polish ขึ้น — inner shadow on active, smoother transition
- เพิ่ม utility classes สำหรับ Cal.com patterns (spacing, shadows)
- เพิ่ม animation utilities — subtle fade-in for cards

---

### Navigation — App Shell
#### [MODIFY] [app-shell.tsx](file:///c:/Users/coffe/bankme/src/components/app-shell.tsx)

- ปรับ header: 64px height, max-width 1200px, clean hairline bottom
- ปรับ logo: Manrope display font, tighter tracking
- ปรับ pill-group nav: proper Cal.com pill-in-pill treatment (soft background wrapper, white active pill with shadow)
- ปรับ mobile nav: full-screen sheet style แทน dropdown
- ปรับ user menu: avatar circle 36px ตาม Cal.com spec

---

### Dashboard — Summary Cards
#### [MODIFY] [summary-cards.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/summary-cards.tsx)

- Income/Expense cards: `bg-surface-card` (#f5f5f5), rounded-lg (12px), padding 32px
- **Balance card**: **featured element** — dark surface `#101010` in light mode, text white, Manrope 700 36px number — **เอา balance card ไว้ตรงกลาง** เป็น hero
- Typography hierarchy: caption label (13px/500) + display number (28px→36px)
- ลด icon size, เพิ่ม subtle bar indicator สำหรับ income/expense direction

---

### Dashboard — Filters
#### [MODIFY] [dashboard-filters.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/dashboard-filters.tsx)

- ใช้ pill-group CSS ที่ปรับแล้วสำหรับ type filter
- Select inputs: rounded-md (8px), 40px height, hairline border
- Search input: rounded-md, hairline border, muted icon
- ปรับ layout spacing ให้ breathe มากขึ้น

---

### Dashboard — Month Picker
#### [MODIFY] [month-picker.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/month-picker.tsx)

- ใช้ button-icon-circular (36px round) สำหรับ arrows
- Display label: Manrope 600, 22px (title-lg)
- Subtle animation on month change

---

### Dashboard — Charts
#### [MODIFY] [expense-pie-chart.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/expense-pie-chart.tsx)

- Card wrapper: rounded-lg (12px), padding 24px
- Title: Manrope 600, 18px (title-md)
- Colors: ปรับ pie colors ให้ใช้ Cal.com badge pastels + monochrome scale
- Donut chart แทน pie (modern look)

#### [MODIFY] [income-expense-bar-chart.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/income-expense-bar-chart.tsx)

- เหมือน pie chart — card styling consistency
- Bar colors: income `#10b981`, expense `#ef4444` (keep) แต่ปรับ bar radius ให้ rounder (6px top)
- Grid lines: softer hairline color

---

### Dashboard — Empty State
#### [MODIFY] [empty-dashboard-state.tsx](file:///c:/Users/coffe/bankme/src/components/dashboard/empty-dashboard-state.tsx)

- ปรับเป็น Cal.com-style CTA band: centered layout, Manrope display heading, muted sub-text, single black primary button
- เอา dashed border ออก, ใช้ surface-card background กับ rounded-lg

---

### Dashboard Client — Layout
#### [MODIFY] [dashboard-client.tsx](file:///c:/Users/coffe/bankme/src/app/(app)/dashboard-client.tsx)

- ปรับ spacing ระหว่าง sections ใช้ `spacing.lg` (24px) กับ `spacing.xl` (32px)
- ปรับ header layout: month picker left, action buttons right — clean separation
- ปรับ section headings: Manrope 600, 18px

---

### Transaction List
#### [MODIFY] [transaction-table.tsx](file:///c:/Users/coffe/bankme/src/components/transactions/transaction-table.tsx)

- Group header: uppercase caption (13px/500), hairline-soft divider
- Transaction items: card surface background, rounded-lg container, clean hover state
- Icon badges: เก็บ rounded-xl ไว้ (16px), ปรับ colors ให้ subtle ขึ้น
- Amount text: Manrope 700 tabular-nums
- Pagination: button-md styling, consistent 8px radius
- Action menu: opacity 0 → group-hover (keep existing)

---

### Transaction Dialog
#### [MODIFY] [transaction-dialog.tsx](file:///c:/Users/coffe/bankme/src/components/transactions/transaction-dialog.tsx)

- Dialog: rounded-xl (16px), clean padding
- Form inputs: 40px height, rounded-md (8px), hairline border
- Type toggle buttons: ปรับเป็น pill-group style
- Submit button: full-width primary black, rounded-md
- ปรับ spacing, label sizing ให้ตาม Cal.com typography

---

### Settings — Category Table
#### [MODIFY] [category-table.tsx](file:///c:/Users/coffe/bankme/src/components/settings/category-table.tsx)

- Page heading: Manrope display
- Table: rounded-lg border, clean hairline dividers
- Action buttons: icon-only, ghost variant, proper hover
- Add form: inline, rounded-md inputs

#### [MODIFY] [settings/page.tsx](file:///c:/Users/coffe/bankme/src/app/(app)/settings/page.tsx)

- ปรับ heading ใช้ display typography

---

### Auth — Login / Signup
#### [MODIFY] [login-form.tsx](file:///c:/Users/coffe/bankme/src/components/auth/login-form.tsx)
#### [MODIFY] [signup-form.tsx](file:///c:/Users/coffe/bankme/src/components/auth/signup-form.tsx)

- Card: rounded-xl (16px), surface-card background, clean padding 32px
- Logo: Manrope display, larger
- Inputs: 40px height, rounded-md, hairline border
- Button: primary black, full-width, rounded-md
- ปรับ spacing ให้ generous ขึ้น

---

### Theme Toggle
#### [MODIFY] [theme-toggle.tsx](file:///c:/Users/coffe/bankme/src/components/theme-toggle.tsx)

- ปรับเป็น button-icon-circular: 36px, rounded-full, hairline border

---

### Root Layout
#### [MODIFY] [layout.tsx](file:///c:/Users/coffe/bankme/src/app/layout.tsx)

- ไม่เปลี่ยน — Manrope + Inter fonts ถูกต้องแล้ว

---

## Files NOT Changed (Logic Layer)

ไฟล์เหล่านี้จะ**ไม่ถูกแก้ไข**เลย:
- `src/app/(app)/page.tsx` — server data fetching
- `src/app/(app)/actions/transactions.ts` — server actions
- `src/app/(app)/actions/categories.ts` — server actions
- `src/lib/*` — all utility/business logic
- `src/components/ui/*` — shadcn/ui base components (จะ override ด้วย CSS เท่านั้น)
- `src/app/(app)/layout.tsx` — app layout structure
- `src/app/login/page.tsx` — login page structure

---

## Verification Plan

### Build Check
```bash
npm run build
```
ต้อง build ผ่านไม่มี error

### Visual Check
```bash
npm run dev
```
เปิดเว็บตรวจสอบ:
1. Login page — logo, form styling, button
2. Dashboard — summary cards (balance dark card), filters, transaction list, charts
3. Settings — category table
4. Dark mode toggle — ทุกหน้า
5. Mobile responsive — hamburger menu, stacked layout

### Functional Check
ทุกฟังก์ชันต้องทำงานเหมือนเดิม:
- [ ] เพิ่ม/แก้ไข/ลบ transaction
- [ ] Filter by type, category, date range
- [ ] Search transactions
- [ ] Export CSV
- [ ] Print report
- [ ] Month navigation
- [ ] Category CRUD (settings page)
- [ ] Login / Signup / Logout
- [ ] Dark/Light theme toggle
