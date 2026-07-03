import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyTripayCallback } from '@/lib/tripay'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-callback-signature') ?? ''

  if (!verifyTripayCallback(rawBody, signature)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as {
    reference: string
    merchant_ref: string
    status: 'PAID' | 'UNPAID' | 'EXPIRED' | 'FAILED' | 'REFUND'
    total_amount: number
  }

  const { merchant_ref, status } = body

  if (status === 'EXPIRED' || status === 'FAILED') {
    const service = createServiceClient()
    await service
      .from('subscription_invoices')
      .update({ status: 'expired' })
      .eq('external_id', merchant_ref)
    return NextResponse.json({ ok: true })
  }

  if (status !== 'PAID') return NextResponse.json({ ok: true })

  const service = createServiceClient()

  const { data: inv } = await service
    .from('subscription_invoices')
    .select('id, plan_id, email, full_name, status, tenant_id')
    .eq('external_id', merchant_ref)
    .single()

  if (!inv || inv.status === 'paid') return NextResponse.json({ ok: true }) // idempotent

  await service
    .from('subscription_invoices')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', inv.id)

  if (inv.tenant_id) {
    const periodStart = new Date().toISOString()
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    await service
      .from('tenant_subscriptions')
      .update({
        plan_id: inv.plan_id,
        status: 'active',
        current_period_start: periodStart,
        current_period_end: periodEnd,
        ai_tokens_used: 0,
        transactions_used: 0,
        overage_transactions: 0,
        notified_80pct: false,
        suspended_notified: false,
      })
      .eq('tenant_id', inv.tenant_id)

    await service
      .from('tenants')
      .update({ is_active: true })
      .eq('id', inv.tenant_id)
  }

  return NextResponse.json({ ok: true })
}
