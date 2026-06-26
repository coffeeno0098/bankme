-- Add columns for Multi-currency and Attachments support

-- Add currency columns
ALTER TABLE public.transactions
  ADD COLUMN currency text NOT NULL DEFAULT 'THB',
  ADD COLUMN exchange_rate numeric(12, 6) NOT NULL DEFAULT 1.0;

-- Add attachment column
ALTER TABLE public.transactions
  ADD COLUMN attachment_path text;
