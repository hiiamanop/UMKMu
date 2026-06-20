import { z } from 'zod'

export const extractedConfigSchema = z.object({
  brand_name: z.string().min(1),
  tagline: z.string().nullable(),
  description: z.string().min(1),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  whatsapp_number: z.string().nullable(),
  instagram_url: z.string().nullable(),
  chatbot_persona: z.string(),
  products: z.array(z.object({
    name: z.string().min(1),
    description: z.string(),
    price: z.number().nullable(),
    skin_types: z.array(z.enum(['oily', 'combination', 'dry', 'sensitive', 'all'])),
    concerns: z.array(z.enum(['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'soothing', 'firming'])),
    ingredients: z.array(z.string()),
    usage_step: z.enum(['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask']).nullable(),
  })).min(1),
})

export type ExtractedConfig = z.infer<typeof extractedConfigSchema>

export function generateSlug(brandName: string): string {
  return brandName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50)
}

export const ONBOARDING_SYSTEM_PROMPT = `Kamu adalah asisten onboarding UMKMku.com untuk brand skincare lokal Indonesia.
Tugasmu: ekstrak informasi bisnis dari cerita merchant dan kembalikan sebagai JSON yang valid.

Aturan:
- Jika warna tidak disebutkan, pilih warna yang cocok untuk brand skincare (soft, clean, premium)
- primary_color: warna utama brand
- secondary_color: warna background atau pelengkap
- accent_color: warna highlight atau CTA
- Semua warna dalam format hex (#rrggbb)
- Jika harga tidak disebutkan, set null
- chatbot_persona: deskripsi kepribadian beauty advisor untuk brand ini (1-2 kalimat)
- Jika Instagram tidak disebutkan, set null
- Jika WhatsApp tidak disebutkan, set null
- Jawab HANYA dengan JSON, tidak ada teks lain`
