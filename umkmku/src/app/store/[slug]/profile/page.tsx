import { notFound, redirect } from 'next/navigation'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { StoreFooter } from '@/components/store/store-footer'
import { ProfileClient } from './_profile-client'

interface Props { params: Promise<{ slug: string }> }

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/store/${slug}/login`)

  const service = createServiceClient()

  const [
    { data: tenant },
    { data: profile },
    { data: orders },
    { data: wishlists },
    { data: products },
  ] = await Promise.all([
    service.from('tenants').select('*').eq('slug', slug).single(),
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(20),
    supabase.from('wishlists').select('product_id, products(*)').eq('user_id', user.id),
    service.from('products').select('*').eq('is_active', true)
      .order('sort_order', { ascending: true }).limit(3),
  ])

  if (!tenant) notFound()

  const wishlistProducts = (wishlists ?? [])
    .map((w: any) => w.products)
    .filter((p: any) => p && p.tenant_id === tenant.id)

  const featuredProducts = (products ?? []).filter((p: any) => p.tenant_id === tenant.id)

  return (
    <>
      <ProfileClient
        tenant={tenant}
        user={{ id: user.id, email: user.email ?? '' }}
        profile={profile ?? null}
        orders={orders ?? []}
        wishlistProducts={wishlistProducts}
        featuredProducts={featuredProducts}
        slug={slug}
      />
      <StoreFooter tenant={tenant} />
    </>
  )
}
