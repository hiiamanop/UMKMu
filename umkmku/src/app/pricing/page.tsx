import type { Metadata } from 'next'
import { PricingContent } from '@/components/pricing/PricingContent'

export const metadata: Metadata = {
  title: 'Harga, UMKMu',
  description: '7 hari trial penuh. Tidak perlu kartu kredit. Toko live dalam 60 detik. Pilih plan yang sesuai bisnis kamu.',
}

export default function PricingPage() {
  return <PricingContent />
}
