import type { Metadata } from 'next'
import { LandingContent } from '@/components/landing/LandingContent'

export const metadata: Metadata = {
  title: 'UMKMu, Buat Toko Online UMKM dalam 60 Detik',
  description: 'Platform toko online terbaik untuk UMKM Indonesia. Subdomain sendiri, AI chatbot penjualan, checkout QRIS, dan manajemen pesanan. Coba gratis 7 hari.',
  openGraph: {
    title: 'UMKMu, Buat Toko Online UMKM dalam 60 Detik',
    description: 'Platform toko online terbaik untuk UMKM Indonesia. Subdomain sendiri, AI chatbot penjualan, checkout QRIS, dan manajemen pesanan.',
    url: 'https://www.umkmu.site',
    type: 'website',
  },
}

export default function LandingPage() {
  return <LandingContent />
}
