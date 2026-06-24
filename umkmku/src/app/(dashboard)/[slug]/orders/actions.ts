'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function updateOrderStatus(slug: string, orderId: string, status: string) {
  const supabase = createServiceClient()

  // Fetch current order status + items before updating (needed for stock logic)
  const { data: currentOrder } = await supabase
    .from('orders')
    .select('status, order_items(product_id, quantity)')
    .eq('id', orderId)
    .single()

  await supabase.from('orders').update({ status, previous_status: currentOrder?.status ?? null }).eq('id', orderId)

  // Deduct stock when payment verified
  if (status === 'payment_verified') {
    for (const item of (currentOrder?.order_items ?? []) as any[]) {
      if (!item.product_id) continue
      await supabase.rpc('decrement_stock', { p_product_id: item.product_id, p_qty: item.quantity })
    }
  }

  // Return stock when cancelled from payment_verified
  if (status === 'cancelled' && currentOrder?.status === 'payment_verified') {
    for (const item of (currentOrder?.order_items ?? []) as any[]) {
      if (!item.product_id) continue
      await supabase.rpc('increment_stock', { p_product_id: item.product_id, p_qty: item.quantity })
    }
  }

  let content: string | null = null

  if (status === 'payment_verified') {
    content = '✅ Pembayaranmu telah diverifikasi oleh merchant! Pesananmu sedang disiapkan untuk pengiriman.'
  } else if (status === 'cancelled') {
    content = '❌ Pesananmu telah dibatalkan. Jika ada pertanyaan, silakan hubungi kami.'
  } else if (status === 'pending_payment') {
    // Fetch order AI note + tenant WA for rejection message
    const { data: order } = await supabase
      .from('orders')
      .select('id, customer_name, payment_ai_note')
      .eq('id', orderId)
      .single()

    const { data: tenant } = await supabase
      .from('tenants')
      .select('brand_name, whatsapp_number')
      .eq('slug', slug)
      .single()

    const aiReason = order?.payment_ai_note
      ? `\n\nAlasan sistem: ${order.payment_ai_note}`
      : ''

    const orderId8 = orderId.slice(-8).toUpperCase()

    let waButton = ''
    if (tenant?.whatsapp_number) {
      const waNum = tenant.whatsapp_number.replace(/\D/g, '')
      const waText = encodeURIComponent(
        `Halo ${tenant.brand_name}, saya ingin mengkonfirmasi pembayaran untuk pesanan #${orderId8}.\n\nBukti pembayaran saya ditolak oleh sistem. Saya yakin telah melakukan pembayaran dengan benar.\n\nMohon bantuan verifikasi manual. Terima kasih.`
      )
      waButton = `\n[WA_BUTTON:https://wa.me/${waNum}?text=${waText}]`
    }

    content = `⚠️ Bukti pembayaranmu belum dapat diverifikasi oleh sistem.${aiReason}\n\nJika kamu yakin telah melakukan pembayaran, kamu bisa mengajukan verifikasi manual langsung ke merchant.${waButton}`
  }

  if (content) {
    await supabase.from('order_chats').insert({ order_id: orderId, role: 'assistant', content })
  }

  revalidatePath(`/${slug}/orders`)
}

export async function submitShipping(slug: string, orderId: string, formData: FormData) {
  const supabase = createServiceClient()
  const courier_name = formData.get('courier_name')?.toString()
  const tracking_number = formData.get('tracking_number')?.toString()
  const shipping_photo_url = formData.get('shipping_photo_url')?.toString() || null

  await supabase.from('orders').update({
    status: 'shipped',
    courier_name,
    tracking_number,
    shipping_photo_url,
  }).eq('id', orderId)

  // Notify user
  const trackingMsg = `🚚 Pesananmu sedang dalam perjalanan!\n\nKurir: **${courier_name}**\nNo. Resi: \`${tracking_number}\`\n\nKamu bisa melacak paketmu menggunakan nomor resi di atas. Terima kasih sudah belanja! 😊`

  await supabase.from('order_chats').insert({
    order_id: orderId,
    role: 'assistant',
    content: trackingMsg,
    attachment_url: shipping_photo_url,
  })

  revalidatePath(`/${slug}/orders`)
}
