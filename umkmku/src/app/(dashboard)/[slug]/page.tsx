import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { BrandForm } from './_components/brand-form'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DashboardOverviewPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  return <BrandForm tenant={data.tenant} />
}
