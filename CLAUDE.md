# UMKMku.com — Project Knowledge Base

> Baca ini di awal setiap session. Ini adalah satu-satunya source of truth untuk keputusan arsitektur, produk, dan teknis.

---

## Framework Guardrails (BACA DULU)

**Peran AI di proyek ini:** co-founder & CTO yang **menantang ide, bukan menyetujui**. Definisi lengkap (portabel, in-repo): [`docs/COFOUNDER_ROLE.md`](docs/COFOUNDER_ROLE.md). Baca itu di awal tiap diskusi strategis.

Sebelum membangun atau mengubah fitur APA PUN, lewati gerbang framework: **invoke skill `umkmku-feature`**. Skill itu memaksa cek scope (feature creep? langgar keputusan final?), pola arsitektur, dan jebakan teknis.

Tiga lapis yang menjaga konsistensi:

1. **CLAUDE.md (file ini)** — WHAT kita bangun + keputusan final (di bawah).
2. **Memory project** — peran, gotcha teknis & status terkini. Wajib diingat:
   - `role-cofounder-cto` — peran Claude: co-founder & CTO yang MENANTANG ide, bukan yes-man
   - `architecture-patterns` — 4 pola wajib
   - `tech-gotchas-ai-ollama` — jebakan mahal (AI SDK+Ollama+Gemma)
   - `prototype-status` — apa yang sudah/belum jalan
   - `feedback-cara-kerja` — gaya kerja Naufa
3. **Skill `umkmku-feature`** — checklist eksekusi.

⚠️ **Jebakan paling mahal:** chat AI **tidak boleh** lewat AI SDK `streamText`/`generateText` dengan Ollama+Gemma (balik kosong karena thinking mode). Pakai Ollama native `/api/chat` + `think: false`. Detail di memory `tech-gotchas-ai-ollama`.

---

## Visi & Misi

**Mission:** Membebaskan brand lokal Indonesia dari ketergantungan platform, dan membangun fondasi digital yang benar-benar mereka miliki.

**Vision:** Dunia di mana setiap brand lokal memiliki identitas digital sendiri — pelanggannya sendiri, datanya sendiri, dan kanal penjualannya sendiri.

**Category:** Brand Infrastructure untuk UMKM lokal Indonesia.

**Category Enemy:** Marketplace-as-foundation (bukan marketplace sebagai channel).

---

## Ideal Customer Profile (ICP)

**Target Utama (Fase 1):** Skincare & Beauty brand lokal Indonesia

| Dimensi | Detail |
|---|---|
| Revenue | IDR 10–100 juta/bulan |
| Channel saat ini | Instagram/TikTok aktif + Shopee/Tokopedia |
| Tim | Founder + 1–3 orang |
| Tech savviness | Bisa pakai smartphone, familiar Instagram/Canva |
| Pain point | Kehilangan repeat buyer, tidak bisa retarget customer lama |
| Willingness to pay | IDR 150k–500k/bulan jika ROI jelas |

**Bukan ICP sekarang:** Warung, FMCG, jasa, merchant tanpa social media presence.

---

## Core Product Concept

### Apa yang Kita Build

Platform multi-tenant di mana merchant UMKM skincare lokal bisa:

1. **Onboarding via AI** — ceritakan bisnis mereka → AI extract config → toko live < 60 detik
2. **Subdomain sendiri** — `nama-brand.umkmku.com`
3. **CMS sederhana** — edit via AI chat atau form langsung
4. **AI Chatbot di toko** — membantu end-customer menemukan produk yang tepat, redirect ke marketplace untuk transaksi
5. **Kepemilikan data** — semua customer interaction tercatat di database merchant sendiri

### Apa yang BUKAN Kita Build di MVP

- Payment gateway (transaksi tetap di marketplace)
- Multiple templates (satu template skincare yang bagus)
- Mobile app
- Dashboard analytics
- SEO tools
- Drag-and-drop page builder
- Integrasi inventory

---

## Keputusan Arsitektur Kritis

### 1. AI Generate KONFIGURASI, bukan KODE

```
❌ Salah: Prompt → Generate React code → Deploy per merchant
✓ Benar: Prompt → Extract JSON config → Template baca config → Render
```

Satu Next.js app melayani semua merchant. Setiap merchant hanya punya data berbeda di Supabase.

### 2. Template adalah batas CMS

CMS hanya expose field yang template support. Merchant tidak bisa minta feature template yang belum ada.

### 3. Provider-agnostic AI Layer

Dev (lokal): Ollama + Gemma 4 12b
Production: Claude API (Anthropic)

Switch hanya via env variable. Zero code change.

### 4. Marketplace sebagai channel, bukan musuh

Di v1, chatbot merekomendasikan produk dan redirect ke Tokopedia/Shopee. Ini adalah fitur, bukan kegagalan. Merchant tidak perlu ubah workflow transaksi mereka.

---

## Tech Stack

| Layer | Technology | Alasan |
|---|---|---|
| Framework | Next.js 16.2.9 (App Router) | SSR + API routes dalam satu project, Vercel-native |
| Language | TypeScript | Type safety untuk multi-tenant config |
| Styling | Tailwind CSS + shadcn/ui | Cepat, consistent, tidak perlu design system custom |
| Database | Supabase (PostgreSQL) | Real-time, RLS untuk multi-tenant security, built-in auth |
| Storage | Supabase Storage | Foto produk merchant |
| AI (dev) | Ollama + Gemma 4 12b | Gratis, lokal, RTX 3060 12GB feasible dengan quantization |
| AI (prod) | Claude API (claude-sonnet-4-6) | Quality terbaik untuk Indonesian language |
| AI SDK | Vercel AI SDK v6 | Provider-agnostic, streaming built-in — TAPI chat di-bypass (lihat Framework Guardrails) |
| Deployment | Vercel | Wildcard subdomain, zero-config Next.js |
| Package Manager | pnpm | Lebih cepat dari npm/yarn |

---

## Database Schema

### `tenants` table

```sql
create table tenants (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,        -- "glow-id" → glow-id.umkmku.com
  created_at      timestamptz default now(),

  -- Brand identity
  brand_name      text not null,
  tagline         text,
  description     text,
  primary_color   text default '#1a1a1a',
  secondary_color text default '#f5f5f5',
  accent_color    text default '#d4a574',
  logo_url        text,
  hero_image_url  text,

  -- Kontak
  whatsapp_number text,
  instagram_url   text,
  tokopedia_url   text,                        -- store-level URL
  shopee_url      text,

  -- Chatbot config
  chatbot_name    text default 'Beauty Advisor',
  chatbot_persona text,

  -- Meta
  is_active       boolean default true,
  owner_email     text
);
```

### `products` table

```sql
create table products (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id) on delete cascade,
  created_at  timestamptz default now(),

  name         text not null,
  description  text,
  price        integer,                        -- rupiah
  image_url    text,

  -- Untuk AI chatbot matching
  skin_types   text[],   -- ['oily','combination','dry','sensitive','all']
  concerns     text[],   -- ['acne','brightening','anti-aging','hydrating','pores']
  ingredients  text[],   -- ['niacinamide','vitamin-c','retinol','ceramide']
  usage_step   text,     -- 'cleanser'|'toner'|'serum'|'moisturizer'|'sunscreen'|'treatment'

  -- Marketplace links per produk
  tokopedia_url text,
  shopee_url    text,

  sort_order   integer default 0,
  is_active    boolean default true
);
```

### `chat_sessions` table

```sql
create table chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid references tenants(id),
  started_at  timestamptz default now(),
  messages    jsonb default '[]',              -- [{role, content, timestamp}]
  ended_at    timestamptz
);
```

---

## Multi-tenant Routing

```
*.umkmku.com → Vercel → Next.js middleware
  │
  ├── umkmku.com          → /app/(marketing)
  ├── dashboard.umkmku.com → /app/(dashboard)
  └── [slug].umkmku.com   → /app/store/[slug]
```

Middleware baca hostname → extract slug → rewrite URL → Next.js render halaman tenant yang benar.

---

## AI Integration Architecture

### Provider Config

```typescript
// lib/ai/provider.ts
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createAnthropic } from '@ai-sdk/anthropic'
import type { LanguageModel } from 'ai'

export function getAIModel(): LanguageModel {
  if ((process.env.AI_PROVIDER ?? 'ollama') === 'ollama') {
    const ollama = createOpenAICompatible({
      name: 'ollama',
      baseURL: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1',
    })
    return ollama(process.env.OLLAMA_MODEL ?? 'gemma4:12b')
  }

  return createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(
    process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'
  )
}
```

> ⚠️ Pakai `@ai-sdk/openai-compatible`, BUKAN `@ai-sdk/openai` (`createOpenAI` hit `/v1/responses` yang Ollama tidak punya). Dan untuk **chat**, layer ini di-bypass total — lihat Framework Guardrails.

### .env.local (dev)

```bash
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=gemma4:12b

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_ROOT_DOMAIN=localhost:3000

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### .env.production

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-6

NEXT_PUBLIC_APP_URL=https://umkmku.com
NEXT_PUBLIC_ROOT_DOMAIN=umkmku.com

SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## AI Onboarding — System Prompt

```
Kamu adalah asisten onboarding UMKMku.com.
Tugasmu: ekstrak informasi bisnis skincare lokal dari cerita merchant.
Kembalikan JSON yang valid tanpa penjelasan tambahan.

Jika ada informasi yang tidak disebutkan, isi dengan nilai default yang masuk akal.
Jangan tanya balik. Ekstrak semua yang bisa, sisanya null.

Response harus berupa JSON murni:
{
  "brand_name": string,
  "tagline": string,
  "description": string,
  "primary_color": string (hex),
  "secondary_color": string (hex),
  "accent_color": string (hex),
  "whatsapp_number": string | null,
  "instagram_url": string | null,
  "chatbot_persona": string,
  "products": [{
    "name": string,
    "description": string,
    "price": number | null,
    "skin_types": string[],
    "concerns": string[],
    "ingredients": string[],
    "usage_step": string
  }]
}
```

---

## AI Chatbot — System Prompt Template

```
Kamu adalah {chatbot_name}, beauty advisor AI untuk {brand_name}.

Tentang brand ini:
{description}

Kepribadianmu: {chatbot_persona}

Produk yang tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan skin type dan concern utama customer jika belum disebutkan
2. Rekomendasikan maksimal 2 produk yang paling relevan
3. Jelaskan MENGAPA produk itu cocok untuk mereka
4. Jika customer tertarik dengan satu produk, akhiri responsmu dengan:
   [[RECOMMEND:product_id]]
5. Gunakan Bahasa Indonesia yang ramah dan profesional
6. Jangan buat klaim medis. Jangan sebut kompetitor.
7. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi.
```

---

## Struktur Folder Project

```
umkmku/
├── app/
│   ├── (marketing)/              # umkmku.com
│   │   ├── page.tsx              # Landing page platform
│   │   └── layout.tsx
│   ├── (dashboard)/              # dashboard.umkmku.com
│   │   ├── onboarding/
│   │   │   └── page.tsx          # AI onboarding chat
│   │   ├── store/
│   │   │   ├── page.tsx          # Overview toko
│   │   │   ├── products/         # CRUD produk
│   │   │   └── appearance/       # Edit visual
│   │   └── layout.tsx
│   ├── store/
│   │   └── [slug]/               # Merchant store pages
│   │       ├── page.tsx          # Store homepage
│   │       └── layout.tsx
│   └── api/
│       ├── onboarding/
│       │   └── route.ts          # AI config extraction
│       └── chat/
│           └── [slug]/
│               └── route.ts      # AI product chatbot
├── components/
│   ├── store/                    # Store template components
│   │   ├── hero.tsx
│   │   ├── product-grid.tsx
│   │   ├── about-section.tsx
│   │   └── chatbot-widget.tsx
│   ├── dashboard/                # CMS components
│   └── ui/                       # shadcn components
├── lib/
│   ├── ai/
│   │   ├── provider.ts           # Model selection (Ollama/Claude)
│   │   ├── onboarding.ts         # Onboarding prompts
│   │   └── chatbot.ts            # Chatbot prompts + action parsing
│   ├── supabase/
│   │   ├── client.ts             # Browser client
│   │   ├── server.ts             # Server client
│   │   └── types.ts              # Generated types
│   └── utils.ts
├── middleware.ts                  # Multi-tenant routing
├── supabase/
│   └── migrations/               # SQL migration files
├── docs/
│   └── superpowers/
│       └── plans/                # Implementation plans
└── .env.local
```

---

## Ollama Setup (Developer)

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model (verifikasi nama exact dengan: ollama list setelah pull)
ollama pull gemma4:12b

# Jalankan server (default port 11434)
ollama serve

# Test
curl http://localhost:11434/v1/models
```

**Catatan RTX 3060 12GB:** Gemma 4 12b dengan Q4_K_M quantization membutuhkan ~8GB VRAM. Fit di 12GB dengan overhead. Jika terlalu berat, gunakan `gemma3:9b` sebagai fallback.

---

## Validasi Metrics (Prototype Goal)

Platform dianggap siap validasi jika:
- [ ] Merchant bisa onboard dan punya toko live dalam < 5 menit
- [ ] Toko bisa diakses via subdomain custom
- [ ] Chatbot bisa merekomendasikan produk dengan benar untuk minimal 3 skin concern berbeda
- [ ] Merchant bisa edit konten dan upload foto via CMS
- [ ] Redirect ke marketplace berfungsi dari chatbot recommendation

---

## Keputusan yang Sudah Final (Jangan Dibuka Lagi)

1. **Stack:** Next.js + Supabase + Vercel AI SDK — tidak ganti
2. **AI approach:** Config generation, bukan code generation — tidak ganti
3. **MVP scope:** Satu template skincare saja — tidak tambah template baru sebelum validasi
4. **Transaksi:** Redirect ke marketplace di v1 — tidak build payment gateway dulu
5. **CMS:** Form + AI chat, bukan visual drag-and-drop — tidak ganti
6. **Nama:** UMKMku.com — final
