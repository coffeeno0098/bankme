"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
  type CreateTransactionInput,
  type UpdateTransactionInput,
} from "@/lib/transactions";

export async function createTransaction(input: CreateTransactionInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };
    }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      transaction_at: input.transaction_at,
      category_id: input.category_id,
      currency: input.currency ?? "THB",
      exchange_rate: input.exchange_rate ?? 1.0,
      attachment_path: input.attachment_path ?? null,
    });

    if (error) {
      console.error("Database error in createTransaction:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in createTransaction server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}

export async function updateTransaction(input: UpdateTransactionInput) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };
    }

    await dbUpdateTransaction(input);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in updateTransaction server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}

export async function deleteTransaction(id: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "กรุณาเข้าสู่ระบบก่อน" };
    }

    await dbDeleteTransaction(id);
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("Unexpected error in deleteTransaction server action:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดที่ไม่รู้จัก",
    };
  }
}


