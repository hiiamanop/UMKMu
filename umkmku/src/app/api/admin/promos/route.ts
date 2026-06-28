import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const db = createServiceClient()
  const { data, error } = await db
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promos: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { code, discount_type, discount_value, min_order_amount, max_discount_amount, usage_limit, valid_until } = body

  if (!code || !discount_type || !discount_value)
    return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('promo_codes')
    .insert({
      code: code.toUpperCase().trim(),
      discount_type,
      discount_value: Number(discount_value),
      min_order_amount: Number(min_order_amount ?? 0),
      max_discount_amount: max_discount_amount ? Number(max_discount_amount) : null,
      usage_limit: usage_limit ? Number(usage_limit) : null,
      valid_until: valid_until || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ promo: data })
}

export async function PATCH(req: NextRequest) {
  const { id, is_active } = await req.json()
  const db = createServiceClient()
  const { error } = await db.from('promo_codes').update({ is_active }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
