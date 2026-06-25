"use server";

import { createClient } from "@/lib/supabase/server";
import { seedDefaultCategories } from "@/lib/categories";

export async function ensureDefaultCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await seedDefaultCategories();
  } catch {
    // Silently fail — onboarding is best-effort
  }
}
