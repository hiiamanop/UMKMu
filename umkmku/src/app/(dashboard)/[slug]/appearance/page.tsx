import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { AppearanceForm } from '../_components/appearance-form'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AppearancePage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  return <AppearanceForm tenant={data.tenant} />
}
