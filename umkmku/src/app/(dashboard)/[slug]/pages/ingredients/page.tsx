import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { IngredientsPageForm } from '../../_components/ingredients-page-form'

export default async function IngredientsSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()
  return <IngredientsPageForm tenant={data.tenant} />
}
