import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Nama wajib diisi' }, { status: 400 })
  const db = createServiceClient()
  await db.from('platform_settings').upsert({ key: 'qris_merchant_name', value: name.trim().toUpperCase(), updated_at: new Date().toISOString() })
  return NextResponse.json({ ok: true })
}
