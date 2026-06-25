"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CreateTransactionInput } from "@/lib/transactions";

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
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
}
