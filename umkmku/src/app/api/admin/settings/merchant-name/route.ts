import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from '@/lib/supabase/admin-guard'

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin()
  if (denied) return denied
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
  const db = createServiceClient()
  await db.from('platform_settings').upsert({ key: 'qris_merchant_name', value: name.trim().toUpperCase(), updated_at: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}
