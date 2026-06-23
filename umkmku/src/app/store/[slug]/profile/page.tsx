import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { StoreFooter } from '@/components/store/store-footer'
import { ProfileClient } from './_profile-client'

interface Props { params: Promise<{ slug: string }> }

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const { tenant, products } = data
  const featuredProducts = products.filter(p => p.is_active).slice(0, 3)

  return (
    <>
      <ProfileClient tenant={tenant} products={featuredProducts} slug={slug} />
      <StoreFooter tenant={tenant} />
    </>
  )
}
