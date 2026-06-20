import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { ProductList } from './_components/product-list'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductsPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  return <ProductList slug={slug} products={data.products} />
}
