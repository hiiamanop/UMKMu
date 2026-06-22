import { ProductsPage } from '@/components/dashboard/ProductsPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductsPageRoute({ params }: Props) {
  const { slug } = await params

  return <ProductsPage />
}
