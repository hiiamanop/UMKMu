CREATE TABLE IF NOT EXISTS promo_codes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT UNIQUE NOT NULL,
  discount_type    TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value   INTEGER NOT NULL,          -- persen (1-100) atau rupiah
  min_order_amount INTEGER NOT NULL DEFAULT 0, -- minimum subtotal untuk pakai promo
  max_discount_amount INTEGER,                 -- cap diskon untuk type percentage (null = unlimited)
  usage_limit      INTEGER,                    -- null = unlimited
  used_count       INTEGER NOT NULL DEFAULT 0,
  valid_until      TIMESTAMPTZ,               -- null = tidak ada batas waktu
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role only" ON promo_codes USING (false);

-- Simpan kode promo yang dipakai di orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER NOT NULL DEFAULT 0;
