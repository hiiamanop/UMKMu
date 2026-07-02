import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase/server'
import { InsightContent } from '@/components/insight/InsightContent'

export const metadata: Metadata = {
  title: 'Insight, Tips & Artikel untuk UMKM Indonesia',
  description: 'Artikel terbaru tentang peluang usaha, tren produk lokal, dan strategi bisnis untuk UMKM Indonesia.',
}

export const revalidate = 3600

export default async function InsightPage() {
  const supabase = createServiceClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, summary, image_url, image_position, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(7)

  return <InsightContent articles={articles} />
}
