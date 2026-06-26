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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
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
    throw new Error(error.message);
  }

  revalidatePath("/");
}

export async function updateTransaction(input: UpdateTransactionInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
  }

  await dbUpdateTransaction(input);
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("กรุณาเข้าสู่ระบบก่อน");
  }

  await dbDeleteTransaction(id);
  revalidatePath("/");
}

