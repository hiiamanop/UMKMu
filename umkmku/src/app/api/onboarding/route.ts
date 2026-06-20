import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { getAIModel } from '@/lib/ai/provider'
import { generateSlug, ONBOARDING_SYSTEM_PROMPT } from '@/lib/ai/onboarding'
import { createServiceClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const description: string = body.description?.trim()

    if (!description || description.length < 20) {
      return NextResponse.json(
        { error: 'Cerita tentang bisnis kamu terlalu singkat. Tolong tambahkan lebih banyak detail.' },
        { status: 400 }
      )
    }

    if (description.length > 3000) {
      return NextResponse.json(
        { error: 'Deskripsi terlalu panjang. Maksimal 3000 karakter.' },
        { status: 400 }
      )
    }

    // Extract config dari AI
    const { text } = await generateText({
      model: getAIModel(),
      system: ONBOARDING_SYSTEM_PROMPT,
      prompt: description,
    })

    // Parse JSON dari response (handle ```json blocks)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/(\{[\s\S]*\})/s)
    if (!jsonMatch) {
      console.error('No JSON found in AI response:', text)
      return NextResponse.json({ error: 'Terjadi kesalahan sistem. Coba lagi.' }, { status: 500 })
    }
    const jsonStr = jsonMatch[1] ?? jsonMatch[0]
    const raw = JSON.parse(jsonStr)

    // Normalize dan apply defaults
    const config = {
      brand_name: String(raw.brand_name ?? 'My Brand'),
      tagline: raw.tagline ? String(raw.tagline) : null,
      description: raw.description ? String(raw.description) : String(raw.brand_name ?? 'Brand skincare lokal'),
      primary_color: /^#[0-9a-fA-F]{6}$/.test(raw.primary_color) ? raw.primary_color : '#1a1a1a',
      secondary_color: /^#[0-9a-fA-F]{6}$/.test(raw.secondary_color) ? raw.secondary_color : '#f5f5f5',
      accent_color: /^#[0-9a-fA-F]{6}$/.test(raw.accent_color) ? raw.accent_color : '#d4a574',
      whatsapp_number: raw.whatsapp_number ? String(raw.whatsapp_number) : null,
      instagram_url: raw.instagram_url ? String(raw.instagram_url) : null,
      chatbot_persona: raw.chatbot_persona ? String(raw.chatbot_persona) : 'Beauty advisor yang ramah dan informatif',
      products: normalizeProducts(raw.products),
    }

    // Generate slug unik
    const supabase = createServiceClient()
    const baseSlug = generateSlug(config.brand_name)
    const slug = await ensureUniqueSlug(supabase, baseSlug)

    // Simpan tenant ke Supabase
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        slug,
        brand_name: config.brand_name,
        tagline: config.tagline,
        description: config.description,
        primary_color: config.primary_color,
        secondary_color: config.secondary_color,
        accent_color: config.accent_color,
        whatsapp_number: config.whatsapp_number,
        instagram_url: config.instagram_url,
        chatbot_name: 'Beauty Advisor',
        chatbot_persona: config.chatbot_persona,
      })
      .select('id')
      .single()

    if (tenantError || !tenant) {
      console.error('Tenant insert error:', tenantError)
      return NextResponse.json({ error: 'Gagal membuat toko' }, { status: 500 })
    }

    // Simpan produk
    if (config.products.length > 0) {
      const products = config.products.map((p, index) => ({
        tenant_id: tenant.id,
        name: p.name,
        description: p.description,
        price: p.price,
        skin_types: p.skin_types,
        concerns: p.concerns,
        ingredients: p.ingredients,
        usage_step: p.usage_step,
        sort_order: index,
      }))

      const { error: productsError } = await supabase
        .from('products')
        .insert(products)

      if (productsError) {
        console.error('Products insert error:', productsError)
      }
    }

    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
    const storeUrl = `http://${slug}.${rootDomain}`

    return NextResponse.json({
      slug,
      brand_name: config.brand_name,
      store_url: storeUrl,
    })
  } catch (err) {
    console.error('Onboarding error:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem. Coba lagi.' },
      { status: 500 }
    )
  }
}

type NormalizedProduct = {
  name: string
  description: string
  price: number | null
  skin_types: string[]
  concerns: string[]
  ingredients: string[]
  usage_step: string | null
}

const VALID_SKIN_TYPES = ['oily', 'combination', 'dry', 'sensitive', 'all']
const VALID_CONCERNS = ['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'soothing', 'firming']
const VALID_USAGE_STEPS = ['cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask']

function normalizeProducts(raw: unknown): NormalizedProduct[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p) => {
      if (typeof p === 'string') {
        return { name: p, description: '', price: null, skin_types: [], concerns: [], ingredients: [], usage_step: null }
      }
      if (typeof p !== 'object' || p === null) return null
      const obj = p as Record<string, unknown>
      return {
        name: String(obj.name ?? ''),
        description: String(obj.description ?? ''),
        price: typeof obj.price === 'number' ? obj.price : null,
        skin_types: filterEnum(obj.skin_types, VALID_SKIN_TYPES),
        concerns: filterEnum(obj.concerns, VALID_CONCERNS),
        ingredients: Array.isArray(obj.ingredients) ? obj.ingredients.map(String) : [],
        usage_step: typeof obj.usage_step === 'string' && VALID_USAGE_STEPS.includes(obj.usage_step) ? obj.usage_step : null,
      }
    })
    .filter((p): p is NormalizedProduct => p !== null && p.name.length > 0)
}

function filterEnum(arr: unknown, valid: string[]): string[] {
  if (!Array.isArray(arr)) return []
  return arr.map(String).filter((v) => valid.includes(v))
}

async function ensureUniqueSlug(
  supabase: SupabaseClient,
  baseSlug: string
): Promise<string> {
  let slug = baseSlug
  let counter = 2

  while (true) {
    const { data } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!data) return slug
    slug = `${baseSlug}-${counter}`
    counter++
  }
}
