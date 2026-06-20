'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Brand & Kontak', path: '' },
  { label: 'Produk', path: '/products' },
  { label: 'Tampilan', path: '/appearance' },
  { label: 'Chatbot', path: '/chatbot' },
]

export function DashboardNav({ slug }: { slug: string }) {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
      {tabs.map((tab) => {
        const href = `/${slug}${tab.path}`
        const isActive = tab.path === ''
          ? pathname === `/${slug}` || pathname === `/${slug}/`
          : pathname.startsWith(`/${slug}${tab.path}`)

        return (
          <Link
            key={tab.path}
            href={href}
            className={cn(
              'flex-1 text-center text-sm py-2 px-3 rounded-md transition-colors',
              isActive
                ? 'bg-white font-medium shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </nav>
  )
}
