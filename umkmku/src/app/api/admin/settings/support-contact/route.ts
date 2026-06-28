import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { phone, email } = await req.json()
  const db = createServiceClient()
  const now = new Date().toISOString()
  await Promise.all([
    phone !== undefined && db.from('platform_settings').upsert({ key: 'support_phone', value: String(phone).trim(), updated_at: now }),
    email !== undefined && db.from('platform_settings').upsert({ key: 'support_email', value: String(email).trim(), updated_at: now }),
  ])
  return NextResponse.json({ ok: true })
}
