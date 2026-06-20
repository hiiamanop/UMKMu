import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'UMKMku — Dashboard',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <span className="font-semibold text-lg">UMKMku.com</span>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
