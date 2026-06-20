import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { DashboardNav } from './_components/dashboard-nav'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function MerchantDashboardLayout({ children, params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const storeUrl = `http://${slug}.${rootDomain}`

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <span className="font-semibold">{data.tenant.brand_name}</span>
          <span className="text-gray-400 mx-2">·</span>
          <a
            href={storeUrl}
            target="_blank"
            className="text-sm text-blue-600 hover:underline"
          >
            Lihat Toko →
          </a>
        </div>
        <span className="text-xs text-gray-400">{slug}.umkmku.com</span>
      </header>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <DashboardNav slug={slug} />
        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
