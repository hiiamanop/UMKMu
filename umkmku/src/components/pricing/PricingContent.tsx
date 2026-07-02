'use client'

import Link from 'next/link'
import { Check, ChevronRight, ArrowLeft, Zap, HelpCircle } from 'lucide-react'
import { useLang, LangToggle } from '@/lib/lang'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const SURFACE = '#F8FAFC'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const T = {
  id: {
    back: 'Kembali', start: 'Mulai Gratis',
    badge: 'Mulai gratis, upgrade kapan saja',
    h1a: 'Harga yang Tumbuh', h1b: 'Bersama Bisnismu',
    sub: '7 hari trial penuh. Tidak perlu kartu kredit. Toko live dalam 60 detik.',
    popular: 'Terpopuler', free: 'Gratis',
    topupTitle: 'Butuh lebih banyak pesanan?',
    topupSub: 'Top-up kapan saja di dashboard, tidak perlu upgrade plan dulu.',
    topupLabel: '50 pesanan tambahan',
    compareTitle: 'Perbandingan Lengkap', faqTitle: 'Pertanyaan Umum',
    ctaH: 'Mulai 7 Hari Gratis', ctaSub: 'Tidak perlu kartu kredit. Toko live dalam 60 detik.', ctaBtn: 'Coba Gratis Sekarang',
    featureCol: 'Fitur',
    plans: [
      { id: 'free', name: 'Free Trial', price: 0, period: '7 hari', desc: 'Coba semua fitur tanpa risiko, tanpa kartu kredit.', cta: 'Mulai Gratis', popular: false, features: ['Toko di subdomain sendiri', 'Onboarding via AI', 'AI Chatbot (10.000 token)', 'Checkout & pembayaran QRIS', 'Manajemen pesanan', 'Notifikasi WhatsApp otomatis', 'Verifikasi pembayaran via AI'], limits: ['Toko disuspend setelah 7 hari (upgrade untuk lanjutkan)'] },
      { id: 'business', name: 'Business', price: 399000, period: '/bulan', desc: 'Untuk brand yang sudah aktif berjualan dan butuh semua fitur.', cta: 'Pilih Business', popular: true, features: ['Semua fitur Free Trial', 'AI Chatbot 1.000.000 token/bulan', '1.000 pesanan/bulan', 'Analitik penjualan 30 hari', 'Top-up pesanan kapan saja', 'Support via WhatsApp'], limits: ['Overage pesanan: Rp 1.000/pesanan ditagih bulan depan'] },
      { id: 'enterprise', name: 'Enterprise', price: 599000, period: '/bulan', desc: 'Untuk brand dengan volume tinggi dan kebutuhan AI intensif.', cta: 'Pilih Enterprise', popular: false, features: ['Semua fitur Business', 'AI Chatbot 50 juta token/bulan', 'Pesanan tidak terbatas', 'Custom chatbot persona & nama', 'Priority support', 'SLA uptime 99.9%'], limits: [] },
    ],
    faqs: [
      { q: 'Apa yang terjadi setelah trial 7 hari habis?', a: 'Toko kamu akan disuspend, customer tidak bisa mengakses toko sampai kamu upgrade ke plan berbayar. Kami kirim notifikasi email dan WhatsApp sebelum dan saat trial habis.' },
      { q: 'Bagaimana cara top-up kuota pesanan?', a: 'Di dashboard merchant, kamu bisa beli paket top-up Rp 10.000 untuk 50 pesanan tambahan kapan saja. Top-up langsung aktif begitu pembayaran dikonfirmasi.' },
      { q: 'Apa itu overage pesanan di Business plan?', a: 'Jika kamu melewati 1.000 pesanan/bulan, pesanan tetap masuk (tidak diblokir). Biaya Rp 1.000 per pesanan lebih akan ditagihkan di bulan berikutnya. Kami kirim notifikasi WA saat kuota tinggal 20%.' },
      { q: 'Apakah token AI bisa ditambah?', a: 'Saat ini token AI tidak bisa di-top-up secara terpisah. Jika token habis sebelum akhir bulan, upgrade ke plan yang lebih tinggi adalah cara termudah.' },
      { q: 'Bagaimana cara pembayaran subscription?', a: 'Saat ini pembayaran dikonfirmasi secara manual oleh tim UMKMu via transfer bank atau QRIS. Kami sedang mengintegrasikan payment gateway otomatis.' },
    ],
    table: [
      ['Toko subdomain sendiri','✓','✓','✓'],['Onboarding via AI','✓','✓','✓'],['Checkout & QRIS','✓','✓','✓'],
      ['Notifikasi WhatsApp','✓','✓','✓'],['Verifikasi bayar via AI','✓','✓','✓'],
      ['AI Chatbot token/bulan','10.000','1.000.000','50.000.000'],['Pesanan/bulan','—','1.000','Tidak terbatas'],
      ['Analitik penjualan','—','✓','✓'],['Top-up pesanan','—','✓','✓'],['Custom chatbot persona','—','—','✓'],
      ['Priority support','—','—','✓'],['Durasi','7 hari','Per bulan','Per bulan'],['Harga','Gratis','Rp 399.000','Rp 599.000'],
    ],
  },
  en: {
    back: 'Back', start: 'Start Free',
    badge: 'Start free, upgrade anytime',
    h1a: 'Pricing That Grows', h1b: 'With Your Business',
    sub: 'Full 7-day trial. No credit card required. Store live in 60 seconds.',
    popular: 'Most Popular', free: 'Free',
    topupTitle: 'Need more orders?',
    topupSub: 'Top-up anytime from the dashboard, no plan upgrade needed.',
    topupLabel: '50 additional orders',
    compareTitle: 'Full Comparison', faqTitle: 'FAQ',
    ctaH: 'Start 7-Day Free Trial', ctaSub: 'No credit card required. Store live in 60 seconds.', ctaBtn: 'Try Free Now',
    featureCol: 'Feature',
    plans: [
      { id: 'free', name: 'Free Trial', price: 0, period: '7 days', desc: 'Try all features risk-free, no credit card.', cta: 'Start Free', popular: false, features: ['Store on your own subdomain', 'AI-powered onboarding', 'AI Chatbot (10,000 tokens)', 'Checkout & QRIS payment', 'Order management', 'Automatic WhatsApp notifications', 'AI payment verification'], limits: ['Store suspended after 7 days (upgrade to continue)'] },
      { id: 'business', name: 'Business', price: 399000, period: '/month', desc: 'For active brands that need all features.', cta: 'Choose Business', popular: true, features: ['All Free Trial features', 'AI Chatbot 1,000,000 tokens/month', '1,000 orders/month', '30-day sales analytics', 'Order top-up anytime', 'WhatsApp support'], limits: ['Order overage: Rp 1,000/order billed next month'] },
      { id: 'enterprise', name: 'Enterprise', price: 599000, period: '/month', desc: 'For high-volume brands with intensive AI needs.', cta: 'Choose Enterprise', popular: false, features: ['All Business features', 'AI Chatbot 50M tokens/month', 'Unlimited orders', 'Custom chatbot persona & name', 'Priority support', '99.9% uptime SLA'], limits: [] },
    ],
    faqs: [
      { q: 'What happens after the 7-day trial ends?', a: 'Your store will be suspended — customers cannot access it until you upgrade to a paid plan. We send email and WhatsApp notifications before and when the trial expires.' },
      { q: 'How do I top up order quota?', a: 'In the merchant dashboard, you can buy a top-up package of Rp 10,000 for 50 additional orders anytime. Top-up is active immediately once payment is confirmed.' },
      { q: 'What is order overage in the Business plan?', a: 'If you exceed 1,000 orders/month, orders still come in (not blocked). The Rp 1,000 per extra order fee is billed the following month. We send a WhatsApp notification when quota is down to 20%.' },
      { q: 'Can I top up AI tokens?', a: 'AI tokens cannot currently be topped up separately. If tokens run out before month end, upgrading to a higher plan is the easiest solution.' },
      { q: 'How does subscription payment work?', a: 'Payments are currently confirmed manually by the UMKMu team via bank transfer or QRIS. We are integrating an automatic payment gateway.' },
    ],
    table: [
      ['Own subdomain store','✓','✓','✓'],['AI onboarding','✓','✓','✓'],['Checkout & QRIS','✓','✓','✓'],
      ['WhatsApp notifications','✓','✓','✓'],['AI payment verification','✓','✓','✓'],
      ['AI Chatbot tokens/month','10,000','1,000,000','50,000,000'],['Orders/month','—','1,000','Unlimited'],
      ['Sales analytics','—','✓','✓'],['Order top-up','—','✓','✓'],['Custom chatbot persona','—','—','✓'],
      ['Priority support','—','—','✓'],['Duration','7 days','Monthly','Monthly'],['Price','Free','Rp 399,000','Rp 599,000'],
    ],
  },
}

export function PricingContent() {
  const { lang, toggle } = useLang()
  const tx = T[lang]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav style={{ borderBottom: `1px solid ${BORDER}` }} className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: TEXT_SEC }}>
            <ArrowLeft size={14} />{tx.back}
          </Link>
          <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <Link href="/onboarding" className="text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: PRIMARY }}>
              {tx.start}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6" style={{ background: `${GOLD}22`, color: '#8B6800' }}>
          <Zap size={14} />{tx.badge}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight" style={{ color: PRIMARY }}>
          {tx.h1a}<br /><span style={{ color: GOLD }}>{tx.h1b}</span>
        </h1>
        <p className="mt-4 text-lg" style={{ color: TEXT_SEC }}>{tx.sub}</p>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tx.plans.map((p) => (
            <div key={p.id} className="rounded-2xl p-8 flex flex-col gap-6"
              style={{ border: p.popular ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}`, background: p.popular ? PRIMARY : 'white' }}>
              <div className="flex flex-col gap-1">
                {p.popular && (
                  <div className="text-xs font-bold px-3 py-1 rounded-full self-start mb-2" style={{ background: GOLD, color: '#1a1a1a' }}>
                    {tx.popular}
                  </div>
                )}
                <div className="text-sm font-medium" style={{ color: p.popular ? 'rgba(255,255,255,0.65)' : TEXT_SEC }}>{p.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold" style={{ color: p.popular ? 'white' : PRIMARY }}>
                    {p.price === 0 ? tx.free : `Rp ${(p.price / 1000).toFixed(0)}k`}
                  </span>
                  {p.price > 0 && <span className="text-sm pb-1" style={{ color: p.popular ? 'rgba(255,255,255,0.55)' : TEXT_SEC }}>{p.period}</span>}
                </div>
                {p.price === 0 && <span className="text-sm" style={{ color: p.popular ? 'rgba(255,255,255,0.55)' : TEXT_SEC }}>{p.period}</span>}
                <p className="text-sm mt-1" style={{ color: p.popular ? 'rgba(255,255,255,0.65)' : TEXT_SEC }}>{p.desc}</p>
              </div>
              <Link href="/onboarding" className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: p.popular ? GOLD : PRIMARY, color: p.popular ? '#1a1a1a' : 'white' }}>
                {p.cta} <ChevronRight size={14} />
              </Link>
              <div className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span style={{ color: p.popular ? 'rgba(255,255,255,0.85)' : TEXT_SEC }}>{f}</span>
                  </div>
                ))}
              </div>
              {p.limits.length > 0 && (
                <div className="flex flex-col gap-2 pt-4" style={{ borderTop: `1px solid ${p.popular ? 'rgba(255,255,255,0.15)' : BORDER}` }}>
                  {p.limits.map((l) => (
                    <div key={l} className="flex items-start gap-2 text-xs">
                      <HelpCircle size={12} className="mt-0.5 shrink-0" style={{ color: p.popular ? 'rgba(255,255,255,0.4)' : TEXT_SEC }} />
                      <span style={{ color: p.popular ? 'rgba(255,255,255,0.5)' : TEXT_SEC }}>{l}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Top-up addon */}
        <div className="mt-8 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
          <div>
            <div className="font-semibold text-sm" style={{ color: PRIMARY }}>{tx.topupTitle}</div>
            <div className="text-sm mt-1" style={{ color: TEXT_SEC }}>{tx.topupSub}</div>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div className="text-lg font-bold" style={{ color: PRIMARY }}>Rp 10.000</div>
            <div className="text-sm px-3 py-1 rounded-full font-medium" style={{ background: `${PRIMARY}15`, color: PRIMARY }}>{tx.topupLabel}</div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ background: SURFACE }} className="py-16">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-2xl font-bold text-center mb-10" style={{ color: PRIMARY }}>{tx.compareTitle}</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: PRIMARY }}>
                  <th className="text-left px-6 py-4 font-medium text-white/70">{tx.featureCol}</th>
                  <th className="px-6 py-4 font-semibold text-white text-center">Free</th>
                  <th className="px-6 py-4 font-semibold text-center" style={{ color: GOLD }}>Business</th>
                  <th className="px-6 py-4 font-semibold text-white text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ borderColor: BORDER }}>
                {tx.table.map(([feature, free, business, enterprise], i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'white' : SURFACE }}>
                    <td className="px-6 py-3 font-medium" style={{ color: PRIMARY }}>{feature}</td>
                    <td className="px-6 py-3 text-center" style={{ color: free === '✓' ? '#16a34a' : free === '—' ? BORDER : TEXT_SEC }}>{free}</td>
                    <td className="px-6 py-3 text-center font-medium" style={{ color: business === '✓' ? '#16a34a' : business === '—' ? BORDER : PRIMARY }}>{business}</td>
                    <td className="px-6 py-3 text-center" style={{ color: enterprise === '✓' ? '#16a34a' : enterprise === '—' ? BORDER : TEXT_SEC }}>{enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 mx-auto max-w-3xl px-6">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ color: PRIMARY }}>{tx.faqTitle}</h2>
        <div className="flex flex-col gap-4">
          {tx.faqs.map((f) => (
            <div key={f.q} className="rounded-xl p-6" style={{ border: `1px solid ${BORDER}` }}>
              <div className="font-semibold text-sm mb-2" style={{ color: PRIMARY }}>{f.q}</div>
              <div className="text-sm leading-relaxed" style={{ color: TEXT_SEC }}>{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16" style={{ background: PRIMARY }}>
        <div className="mx-auto max-w-2xl px-6 text-center flex flex-col items-center gap-5">
          <h2 className="text-3xl font-bold text-white">{tx.ctaH}</h2>
          <p style={{ color: 'rgba(255,255,255,0.65)' }}>{tx.ctaSub}</p>
          <Link href="/onboarding" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90"
            style={{ background: GOLD, color: '#1a1a1a' }}>
            {tx.ctaBtn} <ChevronRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  )
}
