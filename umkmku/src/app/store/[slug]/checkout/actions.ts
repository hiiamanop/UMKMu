'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'

interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
}

export async function createOrder(
  slug: string,
  items: CartItem[],
  customerName: string,
  customerWhatsapp: string,
  shippingAddress: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/store/${slug}/login`)
  if (items.length === 0) return { error: 'Keranjang kosong' }
  const userId = user.id

  const service = createServiceClient()
  const { data: tenant } = await service.from('tenants')
    .select('id, brand_name, qris_image_url')
    .eq('slug', slug)
    .single()
  if (!tenant) return { error: 'Toko tidak ditemukan' }

  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0)

  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    tenant_id: tenant.id,
    user_id: userId,
    total_amount: totalAmount,
    customer_name: customerName,
    customer_whatsapp: customerWhatsapp,
    shipping_address: shippingAddress,
    status: 'pending_payment',
  }).select('id').single()

  if (orderErr || !order) return { error: 'Gagal membuat pesanan' }

  const orderItems = items.map(i => ({
    order_id: order.id,
    product_id: i.productId,
    product_name: i.name,
    product_price: i.price,
    quantity: i.quantity,
    image_url: i.imageUrl,
  }))

  await supabase.from('order_items').insert(orderItems)

  // Seed greeting chat
  const totalFmt = 'Rp ' + totalAmount.toLocaleString('id-ID')
  const itemList = items
    .map(i => `• ${i.name} (x${i.quantity}) — Rp ${(i.price * i.quantity).toLocaleString('id-ID')}`)
    .join('\n')

  const greeting = `Halo! 👋 Terima kasih telah berbelanja di **${tenant.brand_name}**.

Berikut detail pesananmu:
${itemList}

**Total yang harus dibayar: ${totalFmt}**

${tenant.qris_image_url
    ? `Silakan scan QRIS di atas untuk melakukan pembayaran:`
    : `Silakan lakukan pembayaran melalui transfer ke rekening kami. Tim kami akan segera menghubungimu via WhatsApp.`
}

Setelah membayar, kirimkan bukti pembayaran (screenshot) ke chat ini ya! 📸`

  await service.from('order_chats').insert({
    order_id: order.id,
    role: 'assistant',
    content: greeting,
    attachment_url: tenant.qris_image_url || null,
  })

  return { orderId: order.id }
}
