"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCategory(name: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง" };

    const { error } = await supabase
      .from("categories")
      .insert({ user_id: user.id, name: trimmed });

    if (error) {
      if (error.code === "23505") return { success: false, error: "ชื่อหมวดหมู่นี้มีอยู่แล้ว" };
      console.error("Database error in createCategory:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in createCategory server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}

export async function renameCategory(id: string, name: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

    const trimmed = name.trim();
    if (!trimmed) return { success: false, error: "ชื่อหมวดหมู่ต้องไม่เป็นค่าว่าง" };

    const { error } = await supabase
      .from("categories")
      .update({ name: trimmed, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "23505") return { success: false, error: "ชื่อหมวดหมู่นี้มีอยู่แล้ว" };
      console.error("Database error in renameCategory:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in renameCategory server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}

export async function softDeleteCategory(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };

    const { error } = await supabase
      .from("categories")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error in softDeleteCategory:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in softDeleteCategory server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}
