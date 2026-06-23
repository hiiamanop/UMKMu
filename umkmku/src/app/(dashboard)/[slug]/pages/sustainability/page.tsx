import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { SustainabilityPageForm } from '../../_components/sustainability-page-form'

export default async function SustainabilitySettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()
  return <SustainabilityPageForm tenant={data.tenant} />
}
