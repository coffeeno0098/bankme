# BankMe — Feature Enhancement Plan

จากการวิเคราะห์ codebase ทั้งหมดและดู UI ปัจจุบัน พบว่าระบบพื้นฐานแข็งแรงดี แต่มีหลายส่วนที่ขาดหายหรือเพิ่มได้เพื่อให้ใช้งานจริงได้สะดวกขึ้น

## สรุปสิ่งที่มีอยู่แล้ว
- ✅ ระบบ Auth (Login/Signup/Session refresh)
- ✅ CRUD Transaction (สร้าง + ดูรายการ)
- ✅ CRUD Category (สร้าง/แก้ชื่อ/Soft delete)
- ✅ Dashboard summary cards (รายรับ/รายจ่าย/คงเหลือ)
- ✅ กราฟ Pie Chart + Bar Chart (6 เดือนย้อนหลัง)
- ✅ Filter ตาม type/category/search + Month picker
- ✅ Pagination

## สิ่งที่ขาดหายหรือควรเพิ่ม

ผมแบ่งออกเป็น 3 กลุ่ม ตามลำดับความสำคัญ:

---

### 🔴 กลุ่ม A — ฟีเจอร์ที่ขาดไป ควรมี (High Priority)

#### A1. แก้ไข/ลบรายการ (Edit & Delete Transaction)
ตอนนี้มี `updateTransaction` และ `deleteTransaction` อยู่ใน [transactions.ts](file:///c:/Users/coffe/bankme/src/lib/transactions.ts) แล้ว แต่**ยังไม่ได้ต่อเข้า UI เลย** — กดที่รายการใน table ไม่สามารถแก้ไขหรือลบได้

**สิ่งที่ต้องทำ:**
- เพิ่ม Server Actions: `updateTransaction` และ `deleteTransaction` ใน [actions/transactions.ts](file:///c:/Users/coffe/bankme/src/app/(app)/actions/transactions.ts)
- ปรับ [transaction-table.tsx](file:///c:/Users/coffe/bankme/src/components/transactions/transaction-table.tsx): เพิ่ม action menu (edit/delete) ในแต่ละแถว
- ปรับ [transaction-dialog.tsx](file:///c:/Users/coffe/bankme/src/components/transactions/transaction-dialog.tsx): รองรับ mode "edit" โดยรับ transaction data มา prefill
- เพิ่ม confirm dialog ก่อนลบ

#### A2. Export ข้อมูล (CSV/Excel)
ผู้ใช้ควรจะ export รายการในแต่ละเดือนได้ เพื่อเก็บไว้เป็น backup หรือนำไปใช้ต่อ

**สิ่งที่ต้องทำ:**
- เพิ่มปุ่ม "Export CSV" ที่ dashboard header
- สร้าง utility function แปลง transactions เป็น CSV
- Download ฝั่ง client โดยไม่ต้องมี server endpoint

---

### 🟡 กลุ่ม B — ฟีเจอร์ที่เพิ่มแล้วมีประโยชน์มาก (Medium Priority)

#### B1. งบประมาณรายเดือน (Monthly Budget)
ตั้งเป้าหมายการใช้จ่ายรายเดือนแล้วดู progress ได้ — ช่วยให้ควบคุมการใช้เงินดีขึ้น

**สิ่งที่ต้องทำ:**
- สร้าง table `budgets` ใน DB (user_id, month, amount)
- เพิ่ม UI ตั้งงบ + progress bar ใน summary cards
- แสดง warning เมื่อใช้จ่ายเกิน 80% / 100% ของงบ

#### B2. Recurring Transactions (รายการประจำ)
บิลค่าไฟ ค่าเน็ต ค่าเช่าบ้าน ที่เกิดขึ้นทุกเดือน — บันทึกครั้งเดียวแล้วให้ระบบสร้างให้อัตโนมัติ

**สิ่งที่ต้องทำ:**
- เพิ่ม fields: `is_recurring`, `recurrence_rule` ใน transactions
- สร้าง cron job/edge function ที่ Supabase สร้างรายการอัตโนมัติ
- UI ตั้งค่า recurring ใน transaction dialog

#### B3. หมวดหมู่รายรับ (Income Categories)
ตอนนี้ income ไม่มี category เลย (DB constraint บังคับ `category_id IS NULL`) — ทำให้วิเคราะห์แหล่งรายรับไม่ได้

**สิ่งที่ต้องทำ:**
- แก้ DB constraint ให้ income มี category ได้ (optional)
- เพิ่ม type field ใน categories table (income/expense/both)
- เพิ่ม Pie Chart สำหรับรายรับ

---

### 🟢 กลุ่ม C — ฟีเจอร์เสริม ทำให้ดู Pro (Nice to Have)

#### C1. Dark Mode Toggle
ตอนนี้ support dark mode ผ่าน system preference แต่ไม่มีปุ่มสลับ

#### C2. Dashboard Date Range (ดูหลายเดือน)
ให้ user เลือก range เช่น "3 เดือนล่าสุด" หรือ custom range

#### C3. Multi-currency Support
รองรับสกุลเงินอื่นนอกจาก THB

#### C4. Transaction Notes / Attachments
แนบรูปใบเสร็จได้

#### C5. รายงาน PDF
สร้างรายงานสรุปเป็น PDF สวยๆ พร้อมกราฟ

---

## User Review Required

> [!IMPORTANT]
> กรุณาเลือกฟีเจอร์ที่ต้องการจากแต่ละกลุ่ม — ผมแนะนำให้เริ่มจาก **กลุ่ม A ทั้งหมด** (แก้ไข/ลบรายการ + Export CSV) เพราะเป็นสิ่งที่ขาดหายจากระบบปัจจุบันจริงๆ

> [!WARNING]
> กลุ่ม B บางอัน (B1: Budget, B2: Recurring) ต้อง migrate DB schema ซึ่งจะกระทบ production — ต้องวางแผน migration ดีๆ

## Open Questions

1. **กลุ่ม A**: ต้องการทำทั้ง A1 + A2 เลยไหม? หรือเลือกทำแค่ A1 (Edit/Delete) ก่อน?
2. **กลุ่ม B**: มีฟีเจอร์ไหนที่อยากได้เป็นพิเศษไหม?
3. **กลุ่ม C**: สนใจ Dark Mode Toggle ไหม? (ทำง่ายสุดในกลุ่มนี้)
4. **ลำดับการทำ**: อยากให้ทำทีละอันหรือทำหลายอันพร้อมกัน?

---

## ภาพ UI ปัจจุบัน

![Dashboard ปัจจุบัน](C:/Users/coffe/.gemini/antigravity-ide/brain/4d9a06eb-a063-40b0-9d0b-bfad30c8ab5b/top_viewport_1782373397747.png)

![Dashboard ส่วนล่าง](C:/Users/coffe/.gemini/antigravity-ide/brain/4d9a06eb-a063-40b0-9d0b-bfad30c8ab5b/bottom_viewport_1782373406631.png)
