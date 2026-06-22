import { OverviewPage } from '@/components/dashboard/OverviewPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params

  return <OverviewPage tenantSlug={slug} />
}
