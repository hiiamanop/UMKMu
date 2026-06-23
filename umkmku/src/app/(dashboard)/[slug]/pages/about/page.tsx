import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { AboutPageForm } from '../../_components/about-page-form'

export default async function AboutSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()
  return <AboutPageForm tenant={data.tenant} />
}
