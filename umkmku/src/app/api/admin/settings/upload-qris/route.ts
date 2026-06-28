import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'File tidak ada' }, { status: 400 })

  const db = createServiceClient()
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `platform/qris.${ext}`
  const bytes = await file.arrayBuffer()

  const { error } = await db.storage
    .from('payment-proofs')
    .upload(path, Buffer.from(bytes), { contentType: file.type, upsert: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const url = db.storage.from('payment-proofs').getPublicUrl(path).data.publicUrl

  // Simpan ke platform_settings
  await db.from('platform_settings').upsert({ key: 'qris_url', value: url, updated_at: new Date().toISOString() })

  return NextResponse.json({ url })
}
