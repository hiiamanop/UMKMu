import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { calculatePricingBreakdown } from '@/lib/utils/pricing'
import type { Order, Product } from '@/lib/supabase/types'

/**
 * GET /api/orders?slug=tenant_slug&status=&payment_status=&date_from=&date_to=
 * Fetch orders for a tenant with optional filtering
 *
 * Query parameters:
 * - slug: string (required) - tenant slug
 * - status: string (optional) - order status filter
 * - payment_status: string (optional) - payment status filter
 * - date_from: string (optional) - ISO date string
 * - date_to: string (optional) - ISO date string
 *
 * Response:
 * {
 *   success: true,
 *   data: Order[]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')
    const status = searchParams.get('status')
    const paymentStatus = searchParams.get('payment_status')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug query parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Step 1: Get tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Step 2: Build query for orders
    let query = supabase
      .from('orders')
      .select('*')
      .eq('tenant_id', tenant.id)

    // Apply filters
    if (status) {
      query = query.eq('order_status', status)
    }

    if (paymentStatus) {
      query = query.eq('payment_status', paymentStatus)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false })

    const { data: orders, error: ordersError } = await query

    if (ordersError) {
      console.error('Fetch orders error:', ordersError)
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: orders || [],
    })
  } catch (err) {
    console.error('GET /api/orders error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/orders/:tenant_slug/checkout
 * Create an order from cart items and generate QRIS code
 *
 * Request body:
 * {
 *   tenant_slug: string (path parameter),
 *   items: Array<{product_id: string, quantity: number}>,
 *   customer_email: string,
 *   customer_name?: string,
 *   customer_phone?: string,
 *   promo_code?: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     order_id: string,
 *     qris_code?: string,
 *     qris_image_url?: string,
 *     final_price: number,
 *     pricing_breakdown: {
 *       subtotal: number,
 *       ppn: number,
 *       subtotal_with_ppn: number,
 *       xendit_fee: number,
 *       final_price: number
 *     }
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenant_slug,
      items,
      customer_email,
      customer_name = null,
      customer_phone = null,
      promo_code = null,
    } = body

    // Validation
    if (!tenant_slug || typeof tenant_slug !== 'string') {
      return NextResponse.json(
        { error: 'tenant_slug is required and must be a string' },
        { status: 400 }
      )
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'items must be a non-empty array' },
        { status: 400 }
      )
    }

    if (!customer_email || typeof customer_email !== 'string') {
      return NextResponse.json(
        { error: 'customer_email is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate items structure
    for (const item of items) {
      if (
        !item.product_id ||
        typeof item.product_id !== 'string' ||
        typeof item.quantity !== 'number' ||
        item.quantity <= 0
      ) {
        return NextResponse.json(
          {
            error:
              'Each item must have product_id (string) and quantity (positive number)',
          },
          { status: 400 }
        )
      }
    }

    const supabase = createServiceClient()

    // Step 1: Get tenant and verify it exists
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, brand_name, category')
      .eq('slug', tenant_slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Step 2: Fetch products and validate they exist
    const productIds = items.map((item) => item.product_id)
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, name')
      .in('id', productIds)
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)

    if (productsError || !products) {
      console.error('Fetch products error:', productsError)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    // Verify all requested products exist
    const productMap = new Map(products.map((p) => [p.id, p]))
    const missingProducts = items.filter((item) => !productMap.has(item.product_id))

    if (missingProducts.length > 0) {
      return NextResponse.json(
        {
          error: 'One or more products not found',
          missing_ids: missingProducts.map((p) => p.product_id),
        },
        { status: 404 }
      )
    }

    // Step 3: Calculate subtotal
    let subtotal = 0
    const orderItems: Array<{
      product_id: string
      quantity: number
      price_at_purchase: number
      product_name: string
    }> = []

    for (const item of items) {
      const product = productMap.get(item.product_id)!
      const itemTotal = product.price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        product_name: product.name,
      })
    }

    // Handle promo code (simple validation - for MVP)
    let discountAmount = 0
    if (promo_code) {
      // TODO: Implement actual promo code validation and discount calculation
      // For now, we'll accept it but not apply discount
      console.log(`Promo code ${promo_code} received but not yet implemented`)
    }

    // Step 4: Calculate pricing breakdown (PPN + Xendit fee)
    const pricingBreakdown = calculatePricingBreakdown(subtotal)

    // Step 5: Create order record in database
    const orderData: any = {
      tenant_id: tenant.id,
      customer_email: customer_email.toLowerCase().trim(),
      customer_name: customer_name ? String(customer_name).trim() : null,
      customer_phone: customer_phone ? String(customer_phone).trim() : null,
      items: orderItems,
      subtotal: pricingBreakdown.subtotal,
      ppn: pricingBreakdown.ppn,
      subtotal_with_ppn: pricingBreakdown.subtotalWithPpn,
      xendit_fee: pricingBreakdown.xenditFee,
      final_price: pricingBreakdown.finalPrice,
      promo_code: promo_code || null,
      discount_amount: discountAmount,
      payment_status: 'pending',
      order_status: 'pending',
    }

    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id, final_price, subtotal, ppn, subtotal_with_ppn, xendit_fee')
      .single()

    if (insertError || !newOrder) {
      console.error('Create order error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    // Step 6: Call Payment Service to generate QRIS
    // For now, we'll return mock QRIS code
    // In Phase 4 (Task 21), this will call the actual Payment Service API
    const qrisCode = `umkmku_${newOrder.id.slice(0, 8)}_${Date.now()}`
    const qrisImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrisCode)}`

    // Step 7: Save QRIS code to order (in real implementation, this would come from Payment Service)
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        qris_code: qrisCode,
        qris_image_url: qrisImageUrl,
      })
      .eq('id', newOrder.id)

    if (updateError) {
      console.error('Update order with QRIS error:', updateError)
      // Continue anyway - order was created, QRIS update failed
    }

    // Step 8: Return response
    return NextResponse.json(
      {
        success: true,
        data: {
          order_id: newOrder.id,
          qris_code: qrisCode,
          qris_image_url: qrisImageUrl,
          final_price: newOrder.final_price,
          pricing_breakdown: {
            subtotal: newOrder.subtotal,
            ppn: newOrder.ppn,
            subtotal_with_ppn: newOrder.subtotal_with_ppn,
            xendit_fee: newOrder.xendit_fee,
            final_price: newOrder.final_price,
          },
        },
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/orders error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
