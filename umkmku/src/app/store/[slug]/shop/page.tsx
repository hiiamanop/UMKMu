import { notFound } from 'next/navigation'
import { createServiceClient, createClient } from '@/lib/supabase/server'
import { ShopPage } from '@/components/store/shop-page'
import { StoreFooter } from '@/components/store/store-footer'

const LIMIT = 12
const ALL_SKIN_TYPES = ['oily', 'dry', 'combination', 'sensitive', 'normal']

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; skin_types?: string; concerns?: string; sort?: string }>
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const page = Math.max(1, Number(sp.page ?? 1))
  const selectedSkinTypes = sp.skin_types?.split(',').filter(Boolean) ?? []
  const selectedConcerns = sp.concerns?.split(',').filter(Boolean) ?? []
  const sort = sp.sort ?? 'newest'
  const offset = (page - 1) * LIMIT

  const supabase = createServiceClient()

  const { data: tenant } = await supabase
    .from('tenants').select('*').eq('slug', slug).eq('is_active', true).single()
  if (!tenant) notFound()

  // Fetch all products' arrays for building sidebar filter options
  const { data: allForOptions } = await supabase
    .from('products')
    .select('skin_types, concerns')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  const skinTypeOptions = [...new Set(
    (allForOptions ?? []).flatMap(p =>
      (p.skin_types ?? []).flatMap((t: string) => t === 'all' ? ALL_SKIN_TYPES : [t])
    )
  )].sort()

  const concernOptions = [...new Set(
    (allForOptions ?? []).flatMap(p => p.concerns ?? [])
  )].sort()

  // Filtered + paginated products
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)

  if (selectedSkinTypes.length > 0) {
    query = query.or(`skin_types.ov.{${selectedSkinTypes.join(',')}},skin_types.cs.{all}`)
  }
  if (selectedConcerns.length > 0) {
    query = query.overlaps('concerns', selectedConcerns)
  }

  if (sort === 'price_asc') query = query.order('price', { ascending: true })
  else if (sort === 'price_desc') query = query.order('price', { ascending: false })
  else query = query.order('sort_order', { ascending: true })

  const { data: products, count } = await query.range(offset, offset + LIMIT - 1)

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / LIMIT)

  // Fetch current user's wishlist for this tenant
  let wishedProductIds: string[] = []
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (user) {
    const { data: wishlists } = await userClient.from('wishlists')
      .select('product_id').eq('user_id', user.id)
    wishedProductIds = (wishlists ?? []).map((w: any) => w.product_id)
  }

  return (
    <>
      <ShopPage
        tenant={tenant}
        products={products ?? []}
        slug={slug}
        totalCount={totalCount}
        currentPage={page}
        totalPages={totalPages}
        skinTypeOptions={skinTypeOptions}
        concernOptions={concernOptions}
        initialSkinTypes={selectedSkinTypes}
        initialConcerns={selectedConcerns}
        initialSort={sort}
        wishedProductIds={wishedProductIds}
      />
      <StoreFooter tenant={tenant} />
    </>
  )
}
