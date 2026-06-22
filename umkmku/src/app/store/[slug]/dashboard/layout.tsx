import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function DashboardRootLayout({
  children,
  params,
}: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  const { tenant } = data

  // TODO: Add auth guard to check if user is logged in as merchant
  // For now, we'll assume the user has access
  // In Task 7+, implement proper merchant auth

  return (
    <DashboardLayout
      tenantSlug={slug}
      tenantName={tenant.brand_name}
    >
      {children}
    </DashboardLayout>
  )
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) return {}

  return {
    title: `${data.tenant.brand_name} — Dashboard`,
  }
}
