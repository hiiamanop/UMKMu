# HANDOVER — Log Perubahan & Keputusan Per Sesi

> File ini mencatat apa yang berubah, keputusan yang diambil, dan konteks di baliknya.
> Dibaca di awal sesi baru untuk membangun konteks cepat.

---

## Sesi 7 — 2026-07-03 (update 2: migrasi Tripay)

### Migrasi Payment Gateway: Xendit → Tripay

**Alasan:** Xendit verifikasi terlalu kompleks untuk UMKM. Tripay lebih sederhana dan fee lebih murah (QRIS 0.7% vs Xendit 2.5%).

**Files dihapus:**
- `src/lib/xendit.ts`
- `src/app/api/webhooks/xendit/route.ts`

**Files baru:**
- `src/lib/tripay.ts` — `createTripayTransaction()` + `verifyTripayCallback()`
- `src/app/api/webhooks/tripay/route.ts` — handle callback Tripay (`X-Callback-Signature` header, status PAID/EXPIRED/FAILED)
- `supabase/migrations/20260703000001_migrate_to_tripay.sql` — rename DB columns

**Files diubah:**
- `lib/utils/pricing.ts` — `xenditFee` → `gatewayFee`, rate 2.5% → 0.7%
- `lib/supabase/types.ts` — `xendit_fee` → `gateway_fee`, `xendit_invoice_id` → `payment_reference`, `xendit_invoice_url` → `payment_url`
- `components/checkout/PriceBreakdown.tsx` — label "Biaya Tripay (0.7%)"
- `components/checkout/CheckoutLayout.tsx` — prop `xenditFee` → `gatewayFee`
- `app/api/subscribe/create-invoice/route.ts` — integrasikan Tripay, hapus Xendit path
- `app/subscribe/checkout/_checkout-form.tsx` — payment method `'xendit'` → `'tripay'`, button enabled
- `app/api/orders/route.ts` + `[id]/route.ts` — hapus referensi `xendit_fee` (kolom sudah di-drop sejak migration 20260624)
- `app/terms/page.tsx` + `app/privacy/page.tsx` — ganti mention Xendit → Tripay

**DB migration:**
```sql
-- subscription_invoices
xendit_fee      → gateway_fee
xendit_invoice_id → payment_reference
xendit_invoice_url → payment_url
```

**Env vars yang perlu ditambahkan (ganti XENDIT_*):**
```env
TRIPAY_PRIVATE_KEY=      # dari dashboard Tripay: API & Integration > Merchant > Private Key
TRIPAY_MERCHANT_CODE=    # dari dashboard Tripay: API & Integration > Merchant > Merchant Code
```

**Webhook URL yang perlu didaftarkan di Tripay:**
```
https://umkmku.com/api/webhooks/tripay
```

**Hal yang BELUM dilakukan (butuh setelah akun Tripay aktif):**
- Test end-to-end: create transaction → Tripay sandbox → callback → subscription aktif
- Method pembayaran default saat ini tetap `manual_qris` (tetap gratis). Tripay hanya untuk merchant yang pilih opsi gateway.
- Belum ada UI untuk pilih channel pembayaran spesifik Tripay (QRIS/VA/e-wallet) — saat ini default QRIS.

---

### Perubahan UI/UX Dashboard

**Sidebar theming**
- Background sidebar = `primary_color` merchant
- Font color sidebar dihitung server-side via WCAG luminance → `--color-sidebar-text` CSS variable
- Main area selalu `bg-white text-gray-900` (tidak ada merchant color bleeding)

**Neutralisasi warna merchant di dashboard**
- `text-[var(--color-accent)]` di semua file dashboard → diganti `text-gray-*`
- `bg-[var(--color-secondary)]` → `bg-gray-50`
- `text-[var(--color-primary)]` sebagai font color → `#1a1a1a`
- Button `bg-[var(--color-primary)]` → font color pakai `var(--color-sidebar-text)` untuk kontras otomatis

**Files yang diubah (bulk replace):** layout.tsx, dashboard-nav.tsx, appearance-form.tsx, brand-form.tsx, chatbot-form.tsx, testimonials-form.tsx, about-page-form.tsx, ingredients-page-form.tsx, sustainability-page-form.tsx, orders/_orders-client.tsx, chats/_chats-client.tsx, products/*, pages/auth/*, subscription/page.tsx

**Onboarding**
- Placeholder & example diupdate: minta 3 warna eksplisit (primary, secondary, accent), bukan 2

**Chatbot widget**
- Typing indicator "Mengetik..." diganti 3 animated dots (staggered bounce)

**Dashboard assistant**
- System prompt diupdate dengan panduan per-menu lengkap (8 menu: Overview, Brand, Produk, Pesanan, Chat, Tampilan, Chatbot, Langganan)

### Bug Fixes

**Vercel build error** — `_usage-chart.tsx` line 95
- Recharts `Tooltip` formatter: `val` type adalah `ValueType | undefined`, bukan `number`
- Fix: hapus explicit type annotation, tambah `?? 0` fallback

**Articles publish/unpublish lambat**
- Root cause: UI menunggu server response sebelum update (3 sequential network calls: auth → profile query → Supabase update)
- Fix: optimistic update — UI langsung berubah, server call di background, revert kalau gagal

---

## Strategi Skala — Catatan Diskusi (2026-07-03)

### Konteks

Diskusi tentang apakah payment verification harus diganti dari Gemini Vision ke pipeline PaddleOCR + OpenCV + DeepSeek. Ide ini lahir dari pemikiran tentang scaling dan mengurangi ketergantungan pada external AI provider.

### Keputusan: Tidak diimplementasikan sekarang

**Alasan:**
- UMKMku masih di fase validasi. Belum ada bottleneck nyata yang membutuhkan pemisahan service.
- PaddleOCR + OpenCV membutuhkan Python service terpisah (~100-300MB model) — tidak kompatibel dengan Vercel serverless.
- Pipeline 6-step lebih fragile dari 1 Gemini Vision call untuk variasi screenshot bank Indonesia (BCA, GoPay, OVO, Dana, dll).
- Monolith bukan masalah. Tight coupling yang jadi masalah — dan kita belum sampai sana.

### Roadmap Scaling (bertahap, baru dieksekusi saat ada trigger nyata)

```
Fase 1 — Sekarang (validasi):
  Next.js monolith + Vercel + Supabase
  Target: product-market fit, bukan infrastructure optimization

Fase 2 — >100 merchant aktif:
  Payment verification → async worker (bukan sync call)
  Tools: Inngest atau Trigger.dev (serverless, tanpa infra baru)
  Flow: customer upload → job queued → merchant dapat notif hasil
  Ini perubahan paling high-value, paling realistis di short term

Fase 3 — >1000 merchant aktif:
  Dedicated Python/Node service untuk AI/image processing
  → Self-hosted VLM (Qwen2-VL atau LLaVA via Ollama) lebih clean dari pipeline OCR
  → Deploy di Railway/Render, dipanggil via internal HTTP API
  → Baru PaddleOCR/custom model masuk akal di fase ini

Fase 4 — >10k merchant aktif:
  Event-driven architecture, CQRS, read replicas
  Overkill sebelum sampai sini — jangan didesain sekarang
```

### Prinsip yang disepakati

1. **Identify bottleneck dulu** sebelum refactor arsitektur. Data dulu, keputusan kemudian.
2. **AI layer sudah provider-agnostic** via `lib/ai/` — swap Gemini tanpa ubah business logic kapanpun.
3. **Payment verification async** adalah target fase 2, bukan sekarang.
4. **Jangan tambah infra baru** (Python service, queue, worker) sebelum ada angka nyata yang membuktikan kebutuhan.

### Output JSON yang diusulkan (untuk referensi implementasi fase 3)

```json
{
  "sender_name": "Ahmad Naufal",
  "receiver_name": "PT MukaToko Indonesia",
  "amount": 250000,
  "date": "2026-07-03",
  "time": "15:31",
  "status": "Berhasil",
  "bank": "BCA",
  "reference": "98123123981"
}
```

Struktur ini sudah baik — simpan sebagai target output contract saat fase 3 diimplementasikan.
