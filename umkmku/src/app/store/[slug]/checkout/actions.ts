'use server'

import { redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { notifyMerchantNewOrder, notifyCustomerOrderCreated } from '@/lib/notifications/whatsapp'

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
    .select('id, brand_name, qris_image_url, whatsapp_number')
    .eq('slug', slug)
    .single()
  if (!tenant) return { error: 'Toko tidak ditemukan' }

  // Check virtual available stock for each item
  const productIds = items.map(i => i.productId)
  const { data: products } = await service.from('products')
    .select('id, stock_quantity, is_preorder')
    .in('id', productIds)
    .eq('tenant_id', tenant.id)

  const productMap = new Map((products ?? []).map(p => [p.id, p]))

  // Sum qty reserved by active (non-expired) pending orders
  const { data: reservedRows } = await service.from('order_items')
    .select('product_id, quantity, orders!inner(status, expires_at)')
    .in('product_id', productIds)
    .in('orders.status', ['pending_payment', 'payment_submitted'])

  const reserved: Record<string, number> = {}
  for (const row of reservedRows ?? []) {
    const order = (row as any).orders
    if (order.status === 'pending_payment' && order.expires_at && new Date(order.expires_at) < new Date()) continue
    reserved[row.product_id] = (reserved[row.product_id] ?? 0) + row.quantity
  }

  for (const item of items) {
    const p = productMap.get(item.productId)
    if (!p || p.stock_quantity === null || p.is_preorder) continue
    const available = p.stock_quantity - (reserved[item.productId] ?? 0)
    if (available < item.quantity) {
      return { error: `Stok "${item.name}" tidak mencukupi (tersedia: ${Math.max(0, available)})` }
    }
  }

  const totalAmount = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

  const { data: order, error: orderErr } = await supabase.from('orders').insert({
    tenant_id: tenant.id,
    user_id: userId,
    total_amount: totalAmount,
    customer_name: customerName,
    customer_whatsapp: customerWhatsapp,
    shipping_address: shippingAddress,
    status: 'pending_payment',
    expires_at: expiresAt,
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

  // Notifikasi WA — fire-and-forget, tidak blokir response
  if (tenant.whatsapp_number) {
    notifyMerchantNewOrder({
      merchantWa: tenant.whatsapp_number,
      brandName: tenant.brand_name,
      customerName: customerName,
      totalAmount: totalAmount,
      orderId: order.id,
    })
  }
  if (customerWhatsapp) {
    notifyCustomerOrderCreated({
      customerWa: customerWhatsapp,
      brandName: tenant.brand_name,
      customerName: customerName,
      totalAmount: totalAmount,
      orderId: order.id,
    })
  }

  return { orderId: order.id }
}
