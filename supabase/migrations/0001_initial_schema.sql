-- BankMe Initial Schema (Supabase Migration)
-- Run this in Supabase SQL Editor or via supabase migration up.

-- 1. Create custom enum
create type transaction_type as enum ('income', 'expense');

-- 2. Create categories table
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint categories_name_not_empty check (length(trim(name)) > 0)
);

-- Partial unique index: active categories per user must have unique names
create unique index categories_unique_active_name_idx
  on public.categories(user_id, lower(name))
  where deleted_at is null;

-- 3. Create transactions table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type transaction_type not null,
  amount numeric(12, 2) not null,
  description text,
  transaction_at timestamptz not null,
  category_id uuid references public.categories(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint transactions_positive_amount check (amount > 0),
  constraint expense_requires_category check (
    (type = 'expense' and category_id is not null)
    or
    (type = 'income' and category_id is null)
  )
);

-- 4. Enable RLS
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- 5. Categories RLS policies
create policy "categories_select_own"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "categories_insert_own"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "categories_update_own"
  on public.categories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "categories_delete_own"
  on public.categories for delete
  using (auth.uid() = user_id);

-- 6. Transactions RLS policies
create policy "transactions_select_own"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "transactions_insert_own"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "transactions_update_own"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions_delete_own"
  on public.transactions for delete
  using (auth.uid() = user_id);

-- 7. Indexes
create index categories_user_active_idx
  on public.categories(user_id, deleted_at);

create index transactions_user_transaction_at_idx
  on public.transactions(user_id, transaction_at desc);

create index transactions_user_type_idx
  on public.transactions(user_id, type);

-- 8. Trigger for updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger categories_updated_at
  before update on public.categories
  for each row execute function update_updated_at_column();

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute function update_updated_at_column();
