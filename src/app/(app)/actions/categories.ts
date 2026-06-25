"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง");

  const { error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: trimmed });

  if (error) {
    if (error.code === "23505") throw new Error("ชื่อหมวดหมู่นี้มีอยู่แล้ว");
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

export async function renameCategory(id: string, name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง");

  const { error } = await supabase
    .from("categories")
    .update({ name: trimmed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    if (error.code === "23505") throw new Error("ชื่อหมวดหมู่นี้มีอยู่แล้ว");
    throw new Error(error.message);
  }

  revalidatePath("/settings");
}

export async function softDeleteCategory(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("กรุณาเข้าสู่ระบบก่อน");

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/settings");
  revalidatePath("/");
}
