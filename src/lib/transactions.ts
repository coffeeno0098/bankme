import { createClient } from "@/lib/supabase/server";
import type { Transaction } from "@/lib/database.types";

export interface CreateTransactionInput {
  type: "income" | "expense";
  amount: number;
  description: string | null;
  transaction_at: string;
  category_id: string | null;
  currency?: string;
  exchange_rate?: number;
  attachment_path?: string | null;
}

export interface UpdateTransactionInput {
  id: string;
  type?: "income" | "expense";
  amount?: number;
  description?: string | null;
  transaction_at?: string;
  category_id?: string | null;
  currency?: string;
  exchange_rate?: number;
  attachment_path?: string | null;
}

export async function listTransactionsForMonth(selectedMonth: Date): Promise<Transaction[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { start, end } = getMonthRange(selectedMonth);

  const { data, error } = await supabase
    .from("transactions")
    .select("*, categories(id, name)")
    .eq("user_id", user.id)
    .gte("transaction_at", start.toISOString())
    .lt("transaction_at", end.toISOString())
    .order("transaction_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Transaction[];
}

export async function createTransaction(
  input: CreateTransactionInput
): Promise<Transaction> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      type: input.type,
      amount: input.amount,
      description: input.description ?? null,
      transaction_at: input.transaction_at,
      category_id: input.category_id,
      currency: input.currency ?? "THB",
      exchange_rate: input.exchange_rate ?? 1.0,
      attachment_path: input.attachment_path ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function updateTransaction(
  input: UpdateTransactionInput
): Promise<Transaction> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const updates: Record<string, unknown> = {};
  if (input.type !== undefined) updates.type = input.type;
  if (input.amount !== undefined) updates.amount = input.amount;
  if (input.description !== undefined) updates.description = input.description;
  if (input.transaction_at !== undefined) updates.transaction_at = input.transaction_at;
  if (input.category_id !== undefined) updates.category_id = input.category_id;
  if (input.currency !== undefined) updates.currency = input.currency;
  if (input.exchange_rate !== undefined) updates.exchange_rate = input.exchange_rate;
  if (input.attachment_path !== undefined) updates.attachment_path = input.attachment_path;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("transactions")
    .update(updates)
    .eq("id", input.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Transaction;
}

export async function deleteTransaction(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);
}

// Import needed for listTransactionsForMonth
import { getMonthRange } from "./month";
