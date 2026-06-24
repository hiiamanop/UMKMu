import { OrdersPage } from '@/components/dashboard/OrdersPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function OrdersPageRoute({ params }: Props) {
  const { slug } = await params
  return <OrdersPage slug={slug} />
}
