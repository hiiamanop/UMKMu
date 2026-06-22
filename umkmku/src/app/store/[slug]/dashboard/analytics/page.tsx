import { AnalyticsPage } from '@/components/dashboard/AnalyticsPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AnalyticsPageRoute({ params }: Props) {
  const { slug } = await params

  return <AnalyticsPage />
}
