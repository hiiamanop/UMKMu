import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'
import { requireSuperAdmin } from '@/lib/supabase/admin-guard'

export async function POST(req: NextRequest) {
  const denied = await requireSuperAdmin()
  if (denied) return denied
  const { promoCode, message } = await req.json()
  if (!promoCode || !message) return NextResponse.json({ error: 'Kode dan pesan wajib diisi' }, { status: 400 })

  const db = createServiceClient()

  // Ambil semua merchant + leads yang punya nomor WA
  const { data: tenants } = await db
    .from('tenants')
    .select('brand_name, whatsapp_number')
    .not('whatsapp_number', 'is', null)

  if (!tenants?.length) return NextResponse.json({ sent: 0 })

  let sent = 0
  for (const t of tenants) {
    if (!t.whatsapp_number) continue
    try {
      await sendWhatsAppMessage(
        t.whatsapp_number,
        `Halo ${t.brand_name}! 👋\n\n${message}\n\nKode promo: *${promoCode}*`
      )
      sent++
    } catch { /* skip jika gagal */ }
  }

  return NextResponse.json({ sent })
}
