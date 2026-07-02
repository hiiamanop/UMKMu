import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = createServiceClient()
  const { data } = await db
    .from('subscription_invoices')
    .select('status, full_name, email, plan_id')
    .eq('id', id)
    .single()

  return NextResponse.json({
    status: data?.status ?? 'unknown',
    full_name: data?.full_name ?? null,
    email: data?.email ?? null,
    plan_id: data?.plan_id ?? null,
  })
}
