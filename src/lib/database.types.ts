// Minimal type definitions for the BankMe database.
// Full generated types should come from `npx supabase gen types` later.

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  description: string | null;
  transaction_at: string; // ISO timestamptz
  category_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields (when query includes category)
  categories?: {
    id: string;
    name: string;
    deleted_at: string | null;
  } | null;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface CategoryGroup {
  categoryName: string;
  total: number;
}

export interface TrendPoint {
  monthLabel: string; // "YYYY-MM"
  income: number;
  expense: number;
}

// Full Database type for Supabase client generics
export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Category, "id">>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Transaction, "id">>;
      };
    };
  };
}
