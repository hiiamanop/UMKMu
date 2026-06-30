import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { validateCategoryData, type CategoryType } from '@/lib/categories'

/**
 * GET /api/products/[id]?slug=tenant-slug
 * Get a specific product by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slug = request.nextUrl.searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get tenant
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

    // Get product
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .single()

    if (error || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (err) {
    console.error('GET /api/products/[id] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/products/[id]
 * Update a product
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const {
      slug,
      name,
      description,
      price,
      image_url,
      tokopedia_url,
      shopee_url,
      is_active,
      category_type,
      sort_order,
      ...categoryData
    } = body

    // Validation
    if (!slug) {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      )
    }

    if (name && (typeof name !== 'string' || name.trim().length < 2)) {
      return NextResponse.json(
        { error: 'name must be at least 2 characters' },
        { status: 400 }
      )
    }

    if (price !== undefined && price !== null && (typeof price !== 'number' || price < 0)) {
      return NextResponse.json(
        { error: 'price must be a non-negative number' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, category, owner_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current product
    const { data: currentProduct, error: getError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .single()

    if (getError || !currentProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Determine category type
    const finalCategoryType = (category_type || currentProduct.category_type) as CategoryType

    // Validate category-specific data if provided
    let validatedCategoryData: any = null
    if (Object.keys(categoryData).length > 0) {
      const validationResult = validateCategoryData(finalCategoryType, categoryData)
      if (!validationResult.success) {
        const errorMessages = validationResult.error?.errors
          ?.map((e: any) => `${e.path.join('.')}: ${e.message}`)
          .join('; ')
        return NextResponse.json(
          {
            error: 'Category data validation failed',
            details: errorMessages,
          },
          { status: 400 }
        )
      }
      validatedCategoryData = validationResult.data
    }

    // Prepare update data
    const updateData: any = {}

    if (name !== undefined) updateData.name = name.trim()
    if (description !== undefined) updateData.description = description
    if (price !== undefined) updateData.price = price
    if (image_url !== undefined) updateData.image_url = image_url
    if (tokopedia_url !== undefined) updateData.tokopedia_url = tokopedia_url
    if (shopee_url !== undefined) updateData.shopee_url = shopee_url
    if (is_active !== undefined) updateData.is_active = is_active
    if (sort_order !== undefined) updateData.sort_order = sort_order

    // Update category-specific fields
    if (validatedCategoryData) {
      if (finalCategoryType === 'skincare') {
        updateData.skincare_data = validatedCategoryData
        updateData.skin_types = validatedCategoryData?.skin_types || []
        updateData.concerns = validatedCategoryData?.concerns || []
        updateData.ingredients = validatedCategoryData?.ingredients || []
        updateData.usage_step = validatedCategoryData?.usage_step || null
      } else if (finalCategoryType === 'parfum') {
        updateData.parfum_data = validatedCategoryData
      } else if (finalCategoryType === 'fashion') {
        updateData.fashion_data = validatedCategoryData
      } else if (finalCategoryType === 'fdb') {
        updateData.fdb_data = validatedCategoryData
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    // Update product
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .select()
      .single()

    if (updateError || !updatedProduct) {
      console.error('Update product error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedProduct,
    })
  } catch (err) {
    console.error('PUT /api/products/[id] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/products/[id]?slug=tenant-slug
 * Delete a product
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authClient = await createClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const slug = request.nextUrl.searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'slug parameter is required' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Get tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, owner_id')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }

    if (tenant.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Verify product exists before deleting
    const { data: product } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .eq('tenant_id', tenant.id)
      .single()

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Delete product
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
      .eq('tenant_id', tenant.id)

    if (deleteError) {
      console.error('Delete product error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    })
  } catch (err) {
    console.error('DELETE /api/products/[id] error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
