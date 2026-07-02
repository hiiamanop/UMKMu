import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { ArticleContent } from '@/components/insight/ArticleContent'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data } = await supabase
    .from('articles')
    .select('title, summary, image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Artikel tidak ditemukan' }

  return {
    title: data.title,
    description: data.summary ?? undefined,
    openGraph: {
      title: data.title,
      description: data.summary ?? undefined,
      type: 'article',
      ...(data.image_url ? { images: [{ url: data.image_url, width: 1200, height: 630 }] } : {}),
    },
  }
}

export const revalidate = 3600

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  return <ArticleContent article={article} />
}
