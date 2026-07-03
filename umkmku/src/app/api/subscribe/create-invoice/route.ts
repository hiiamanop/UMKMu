import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculatePricingBreakdown } from '@/lib/utils/pricing'
import { createTripayTransaction } from '@/lib/tripay'

const PLAN_PRICES: Record<string, number> = { business: 399000, enterprise: 599000 }

export async function POST(req: NextRequest) {
  const { planId, fullName, email, phone, paymentMethod = 'manual_qris', slug } = await req.json()
  if (!planId || !email || !fullName) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })

  const basePrice = PLAN_PRICES[planId]
  if (!basePrice) return NextResponse.json({ error: 'Plan tidak valid' }, { status: 400 })

  const useTripay = paymentMethod === 'tripay'
  const pricing = calculatePricingBreakdown(basePrice, useTripay)
  const service = createServiceClient()
  const externalId = `umkmku_sub_${planId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  let tenantId: string | null = null
  if (slug) {
    const { data: t } = await service.from('tenants').select('id').eq('slug', slug).single()
    tenantId = t?.id ?? null
  }

  const { data: invoice, error: dbErr } = await service
    .from('subscription_invoices')
    .insert({
      external_id: externalId,
      plan_id: planId,
      email,
      full_name: fullName,
      phone: phone || null,
      amount: pricing.subtotal,
      ppn: pricing.ppn,
      gateway_fee: pricing.gatewayFee,
      final_amount: pricing.finalPrice,
      payment_method: paymentMethod,
      tenant_id: tenantId,
    })
    .select('id')
    .single()

  if (dbErr || !invoice) return NextResponse.json({ error: 'Gagal menyimpan invoice' }, { status: 500 })

  if (paymentMethod === 'manual_qris') {
    return NextResponse.json({ redirectUrl: `/subscribe/payment/qris?id=${invoice.id}` })
  }

  if (useTripay) {
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://umkmku.com'
      const planLabel = planId === 'business' ? 'Business' : 'Enterprise'

      const tx = await createTripayTransaction({
        merchantRef: externalId,
        amount: pricing.finalPrice,
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone || undefined,
        items: [{ name: `UMKMku ${planLabel} Plan`, price: pricing.finalPrice, quantity: 1 }],
        returnUrl: `${appUrl}/subscribe/success?id=${invoice.id}`,
      })

      await service
        .from('subscription_invoices')
        .update({ payment_reference: tx.reference, payment_url: tx.payment_url })
        .eq('id', invoice.id)

      return NextResponse.json({ redirectUrl: tx.payment_url })
    } catch (err) {
      await service.from('subscription_invoices').delete().eq('id', invoice.id)
      const msg = err instanceof Error ? err.message : 'Gagal membuat transaksi Tripay'
      return NextResponse.json({ error: msg }, { status: 502 })
    }
  }

  await service.from('subscription_invoices').delete().eq('id', invoice.id)
  return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 })
}
