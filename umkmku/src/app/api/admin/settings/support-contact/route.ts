import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/admin-guard'

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin()
  if (denied) return denied
  const { phone, email } = await req.json()
  const db = createServiceClient()
  const now = new Date().toISOString()
  await Promise.all([
    phone !== undefined && db.from('platform_settings').upsert({ key: 'support_phone', value: String(phone).trim(), updated_at: now }),
    email !== undefined && db.from('platform_settings').upsert({ key: 'support_email', value: String(email).trim(), updated_at: now }),
  ])
  return NextResponse.json({ ok: true })
}
