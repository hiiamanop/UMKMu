'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft } from 'lucide-react'
import { useLang, LangToggle, type Lang } from '@/lib/lang'

const T = {
  id: { allArticles: 'Semua artikel', ctaTitle: 'Siap punya toko online sendiri?', ctaSub: 'Gratis 7 hari, toko live dalam 60 detik.', ctaBtn: 'Mulai Gratis →' },
  en: { allArticles: 'All articles', ctaTitle: 'Ready to own your online store?', ctaSub: '7-day free trial, store live in 60 seconds.', ctaBtn: 'Start Free →' },
}

function formatDate(iso: string | null, lang: Lang) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

interface Article {
  title: string
  summary: string | null
  image_url: string | null
  image_position: string | null
  published_at: string | null
  content: string
}

export function ArticleContent({ article }: { article: Article }) {
  const { lang, toggle } = useLang()
  const tx = T[lang]

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Top nav */}
      <div className="bg-white border-b border-[#E5EAF0] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/insight" className="flex items-center gap-2 text-sm text-[#5E6B85] hover:text-[#0A2F73] transition-colors">
            <ArrowLeft size={14} />{tx.allArticles}
          </Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <Link href="/"><img src="/logo.png" alt="UMKMu" className="h-7 w-auto" /></Link>
          </div>
        </div>
      </div>

      {/* Hero image */}
      {article.image_url && (
        <div className="relative w-full h-80 md:h-[480px] bg-[#E5EAF0]">
          <Image src={article.image_url} alt={article.title} fill className="object-cover"
            style={{ objectPosition: article.image_position ?? '50% 50%' }} priority />
        </div>
      )}

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-xs text-[#9AACBF] mb-4">
          <Calendar size={12} />
          {formatDate(article.published_at, lang)}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0A2F73] leading-tight mb-4">{article.title}</h1>
        {article.summary && (
          <p className="text-lg text-[#5E6B85] border-l-4 border-[#0A2F73] pl-4 mb-8 leading-relaxed">{article.summary}</p>
        )}
        <div
          className="prose prose-slate max-w-none text-justify
            prose-headings:text-[#0A2F73] prose-headings:font-semibold prose-headings:text-left
            prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-[#374151] prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-[#374151] prose-li:mb-1
            prose-ul:my-4 prose-ul:pl-6
            prose-strong:text-[#0A2F73]
            prose-a:text-[#0A2F73] prose-a:underline"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* CTA */}
      <div className="border-t border-[#E5EAF0] bg-white mt-4">
        <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#0A2F73]">{tx.ctaTitle}</p>
            <p className="text-sm text-[#5E6B85]">{tx.ctaSub}</p>
          </div>
          <Link href="/" className="px-6 py-3 rounded-xl bg-[#0A2F73] text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
            {tx.ctaBtn}
          </Link>
        </div>
      </div>
    </main>
  )
}
