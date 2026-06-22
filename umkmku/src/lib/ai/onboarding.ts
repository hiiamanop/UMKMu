import { z } from 'zod'
import type { CategoryType } from '@/lib/categories'

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

/**
 * Get onboarding system prompt for a specific category
 * @param category The product category
 * @returns System prompt string
 */
export function getOnboardingSystemPrompt(category: CategoryType): string {
  const basePrompt = `Kamu adalah asisten onboarding UMKMku.com untuk brand ${category} lokal Indonesia.
Tugasmu: ekstrak informasi bisnis dari cerita merchant dan kembalikan sebagai JSON yang valid.

Aturan umum:
- Jika warna tidak disebutkan, pilih warna yang cocok untuk brand ${category}
- primary_color: warna utama brand
- secondary_color: warna background atau pelengkap
- accent_color: warna highlight atau CTA
- Semua warna dalam format hex (#rrggbb)
- Jika harga tidak disebutkan, set null
- chatbot_persona: deskripsi kepribadian advisor untuk brand ini (1-2 kalimat)
- Jika Instagram tidak disebutkan, set null
- Jika WhatsApp tidak disebutkan, set null`

  const categoryRules = getCategoryOnboardingRules(category)

  return `${basePrompt}

${categoryRules}

Jawab HANYA dengan JSON, tidak ada teks lain.`
}

function getCategoryOnboardingRules(category: CategoryType): string {
  switch (category) {
    case 'skincare':
      return `Aturan khusus skincare:
- Untuk setiap produk, extract: name, description, price
- Extract juga: skin_types (array dari: oily, combination, dry, sensitive, all)
- Extract: concerns (array dari: acne, brightening, anti-aging, hydrating, pores, soothing, firming)
- Extract: ingredients (array dari nama ingredients)
- Extract: usage_step (dari: cleanser, toner, serum, moisturizer, sunscreen, treatment, mask)`

    case 'parfum':
      return `Aturan khusus parfum:
- Untuk setiap produk, extract: name, description, price
- Extract juga: fragrance_family (array dari: floral, woody, fresh, oriental, chypre)
- Extract: notes_top (array dari top notes)
- Extract: notes_middle (array dari middle notes)
- Extract: notes_base (array dari base notes)
- Extract: size (dari: 30, 50, 100, 200)
- Extract: longevity (dari: light, moderate, long-lasting)`

    case 'fashion':
      return `Aturan khusus fashion:
- Untuk setiap produk, extract: name, description, price
- Extract juga: sizes (array dari available sizes, contoh: ["S", "M", "L", "XL"])
- Extract: colors (array dari warna tersedia)
- Extract: materials (array dari material)
- Extract: fit (HARUS salah satu dari: slim, regular, relaxed, oversized)
- Extract: style (array dari style tags, contoh: ["casual", "sporty"])`

    case 'fdb':
      return `Aturan khusus F&B:
- Untuk setiap produk, extract: name, description, price
- Extract juga: ingredients (array dari nama ingredients)
- Extract: allergens (array dari nama allergen, boleh apa saja)
- Extract: preparation_time (NUMBER dalam menit, contoh: 30 untuk "30 menit")
- Extract: servings (NUMBER jumlah porsi)
- Extract: dietary (array dari: vegan, vegetarian, gluten-free, halal)`

    default:
      return ''
  }
}

/**
 * Backward compatibility - export old constant as default skincare
 */
export const ONBOARDING_SYSTEM_PROMPT = getOnboardingSystemPrompt('skincare')
