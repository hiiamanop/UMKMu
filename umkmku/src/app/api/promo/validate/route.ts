import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code || !subtotal) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const db = createServiceClient()
  const { data: promo } = await db
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('is_active', true)
    .maybeSingle()

  if (!promo) return NextResponse.json({ error: 'Kode promo tidak valid atau tidak aktif' }, { status: 404 })
  if (promo.valid_until && new Date(promo.valid_until) < new Date())
    return NextResponse.json({ error: 'Kode promo sudah kadaluarsa' }, { status: 400 })
  if (promo.usage_limit !== null && promo.used_count >= promo.usage_limit)
    return NextResponse.json({ error: 'Kode promo sudah habis digunakan' }, { status: 400 })
  if (subtotal < promo.min_order_amount)
    return NextResponse.json({
      error: `Minimum order Rp ${promo.min_order_amount.toLocaleString('id-ID')} untuk pakai promo ini`
    }, { status: 400 })

  let discount = promo.discount_type === 'percentage'
    ? Math.round(subtotal * promo.discount_value / 100)
    : promo.discount_value

  if (promo.max_discount_amount) discount = Math.min(discount, promo.max_discount_amount)
  discount = Math.min(discount, subtotal) // tidak boleh melebihi subtotal

  return NextResponse.json({ discount, promoId: promo.id, code: promo.code })
}
