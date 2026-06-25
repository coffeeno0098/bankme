import { listActiveCategories } from "@/lib/categories";
import { CategoryTable } from "@/components/settings/category-table";

export default async function SettingsPage() {
  const categories = await listActiveCategories();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">ตั้งค่า</h1>
        <p className="text-muted-foreground">จัดการหมวดหมู่รายจ่ายของคุณ</p>
      </div>
      <CategoryTable categories={categories} />
    </div>
  );
}
