import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { DashboardNav } from './_components/dashboard-nav'
import { ExternalLink } from 'lucide-react'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function MerchantDashboardLayout({ children, params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  const { tenant } = data
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const storeUrl = `http://${slug}.${rootDomain}`

  return (
    <div
      className="min-h-screen flex"
      style={{
        '--color-primary': tenant.primary_color,
        '--color-secondary': tenant.secondary_color,
        '--color-accent': tenant.accent_color,
      } as React.CSSProperties}
    >
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[var(--color-primary)] flex flex-col min-h-screen sticky top-0">
        {/* Brand */}
        <div className="px-8 pt-10 pb-8 border-b border-white/10">
          <span className="text-white text-xl font-serif italic leading-tight block">
            {tenant.brand_name}
          </span>
          <span className="text-white/40 text-[11px] mt-1 block tracking-widest uppercase font-sans">
            Dashboard
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 py-6 px-4">
          <DashboardNav slug={slug} />
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs tracking-widest uppercase font-sans"
          >
            <ExternalLink size={12} />
            Lihat Toko
          </a>
          <span className="text-white/25 text-[10px] mt-2 block font-sans">{slug}.umkmku.com</span>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 bg-[var(--color-secondary)] flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white/60 backdrop-blur border-b border-black/5 px-10 py-4 flex items-center justify-between sticky top-0 z-10">
          <p className="text-label-caps text-[var(--color-accent)]/50">
            UMKMku.com — Merchant Portal
          </p>
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-caps text-[10px] text-[var(--color-primary)] flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            Preview Toko <ExternalLink size={10} />
          </a>
        </header>

        {/* Content */}
        <main className="flex-1 px-10 py-10 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
