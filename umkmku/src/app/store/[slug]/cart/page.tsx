import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { StoreFooter } from '@/components/store/store-footer'
import { CartClient } from './_cart-client'

interface Props { params: Promise<{ slug: string }> }

export default async function CartPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const { tenant, products } = data
  const crossSell = products.filter(p => p.is_active).slice(0, 4)

  return (
    <>
      <CartClient tenant={tenant} crossSell={crossSell} slug={slug} />
      <StoreFooter tenant={tenant} />
    </>
  )
}
