import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/database.types";

const DEFAULT_CATEGORIES = [
  "ของกิน",
  "เครื่องดื่ม",
  "ค่าเดินทาง",
  "ที่พัก",
  "ช้อปปิ้ง",
];

export async function listActiveCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .is("deleted_at", null)
    .order("name");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: name.trim() })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("ชื่อหมวดหมู่นี้มีอยู่แล้ว");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function renameCategory(id: string, name: string): Promise<Category> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("categories")
    .update({ name: name.trim(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("ชื่อหมวดหมู่นี้มีอยู่แล้ว");
    }
    throw new Error(error.message);
  }
  return data;
}

export async function softDeleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

export async function seedDefaultCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const existing = await listActiveCategories();
  const existingNames = new Set(existing.map((c) => c.name));

  const toCreate = DEFAULT_CATEGORIES.filter((name) => !existingNames.has(name));

  if (toCreate.length === 0) return existing;

  const { data, error } = await supabase
    .from("categories")
    .insert(toCreate.map((name) => ({ user_id: user.id, name })))
    .select();

  if (error) throw new Error(error.message);
  return [...existing, ...(data ?? [])];
}
