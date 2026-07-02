'use client'

import Link from 'next/link'
import { useLang, LangToggle, type Lang } from '@/lib/lang'
import { TemplatesGallery } from '@/app/templates/_components/templates-gallery'

const PRIMARY = '#0A2F73'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const CATEGORIES: Record<Lang, { value: string; label: string }[]> = {
  id: [
    { value: '', label: 'Semua' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'parfum', label: 'Parfum' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'fdb', label: 'F&B' },
  ],
  en: [
    { value: '', label: 'All' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'parfum', label: 'Perfume' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'fdb', label: 'F&B' },
  ],
}

const T = {
  id: {
    feature: 'Fitur', pricing: 'Harga', templates: 'Templates', insight: 'Insight', start: 'Mulai Gratis',
    heading: 'Template Toko',
    sub: 'Pilih tampilan yang paling cocok untuk brandmu. AI akan mengisi konten secara otomatis.',
  },
  en: {
    feature: 'Features', pricing: 'Pricing', templates: 'Templates', insight: 'Insight', start: 'Start Free',
    heading: 'Store Templates',
    sub: 'Choose the look that fits your brand best. AI will fill in the content automatically.',
  },
}

interface Template {
  id: string
  name: string
  description: string | null
  category: string
  template_key: string
  preview_urls: string[]
  demo_url: string | null
}

export function TemplatesContent({ templates }: { templates: Template[] }) {
  const { lang, toggle } = useLang()
  const tx = T[lang]

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <nav style={{ borderBottom: `1px solid ${BORDER}` }} className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
          <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: TEXT_SEC }}>
            <Link href="/#fitur" className="hover:text-[#0A2F73] transition-colors">{tx.feature}</Link>
            <Link href="/templates" className="font-semibold" style={{ color: PRIMARY }}>{tx.templates}</Link>
            <Link href="/pricing" className="hover:text-[#0A2F73] transition-colors">{tx.pricing}</Link>
            <Link href="/insight" className="hover:text-[#0A2F73] transition-colors">{tx.insight}</Link>
          </div>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <Link href="/onboarding" className="text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90 text-white" style={{ background: PRIMARY }}>
              {tx.start}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10 text-center">
        <h1 className="text-4xl font-bold mb-3" style={{ color: PRIMARY }}>{tx.heading}</h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: TEXT_SEC }}>{tx.sub}</p>
      </div>

      <TemplatesGallery templates={templates} categories={CATEGORIES[lang]} lang={lang} />
    </div>
  )
}
