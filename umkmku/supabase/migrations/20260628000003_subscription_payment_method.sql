ALTER TABLE subscription_invoices
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'manual_qris'
    CHECK (payment_method IN ('manual_qris', 'xendit')),
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;
