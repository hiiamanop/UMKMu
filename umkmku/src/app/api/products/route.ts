import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateCategoryData, type CategoryType } from '@/lib/categories'
import type { Product } from '@/lib/supabase/types'

/**
 * GET /api/products?slug=tenant-slug
 * List all products for a tenant
 */
export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get('slug')
    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get tenant to verify it exists and to get tenant_id
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, category')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Get all products for the tenant, ordered by sort_order
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('tenant_id', tenant.id)
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('Fetch products error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: products || [],
      count: products?.length || 0,
    })
  } catch (err) {
    console.error('GET /api/products error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/products
 * Create a new product for a tenant
 * Body: {
 *   slug: string,
 *   name: string,
 *   description?: string,
 *   price?: number,
 *   image_url?: string,
 *   tokopedia_url?: string,
 *   shopee_url?: string,
 *   is_active?: boolean,
 *   category_type: string, // must match tenant category
 *   [category-specific fields]: e.g., skin_types, concerns for skincare
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      slug,
      name,
      description = null,
      price = null,
      image_url = null,
      tokopedia_url = null,
      shopee_url = null,
      is_active = true,
      category_type, // skincare, parfum, fashion, fdb
      // Category-specific fields are passed separately
      ...categoryData
    } = body

    // Validation
    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      )
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (price !== null && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'price must be a non-negative number' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, category')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    // Validate category-specific data
    const finalCategoryType = (category_type || tenant.category) as CategoryType
    const validationResult = validateCategoryData(finalCategoryType, categoryData)

    if (!validationResult.success) {
      const errorMessages = validationResult.error?.errors
        ?.map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ')
      return NextResponse.json(
        {
          error: 'Category data validation failed',
          details: errorMessages,
        },
        { status: 400 }
      )
    }

    // Get next sort_order
    const { data: maxSortProduct } = await supabase
      .from('products')
      .select('sort_order')
      .eq('tenant_id', tenant.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const nextSortOrder = (maxSortProduct?.sort_order ?? -1) + 1

    // Prepare product data based on category
    const productData: any = {
      tenant_id: tenant.id,
      name: name.trim(),
      description: description ? String(description).trim() : null,
      price: price,
      image_url: image_url,
      category_type: finalCategoryType,
      tokopedia_url: tokopedia_url,
      shopee_url: shopee_url,
      is_active: is_active,
      sort_order: nextSortOrder,
      // Legacy skincare fields for backward compatibility
      skin_types: [],
      concerns: [],
      ingredients: [],
      usage_step: null,
    }

    // Set category-specific fields
    if (finalCategoryType === 'skincare') {
      productData.skincare_data = validationResult.data
      productData.skin_types = validationResult.data?.skin_types || []
      productData.concerns = validationResult.data?.concerns || []
      productData.ingredients = validationResult.data?.ingredients || []
      productData.usage_step = validationResult.data?.usage_step || null
    } else if (finalCategoryType === 'parfum') {
      productData.parfum_data = validationResult.data
    } else if (finalCategoryType === 'fashion') {
      productData.fashion_data = validationResult.data
    } else if (finalCategoryType === 'fdb') {
      productData.fdb_data = validationResult.data
    }

    // Insert product
    const { data: newProduct, error: insertError } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (insertError || !newProduct) {
      console.error('Insert product error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        data: newProduct,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('POST /api/products error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
