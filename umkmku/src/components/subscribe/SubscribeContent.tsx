'use client'

import Link from 'next/link'
import { Check, ChevronRight, ArrowLeft, Zap, Shield } from 'lucide-react'
import { useLang, LangToggle } from '@/lib/lang'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const SURFACE = '#F8FAFC'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const T = {
  id: {
    back: 'Kembali', compareLink: 'Bandingkan semua fitur →',
    badge: 'Pilih plan yang sesuai bisnismu',
    heading: 'Mulai dengan 7 Hari Gratis',
    sub: 'Toko live dalam 60 detik. Tidak perlu kartu kredit untuk trial. Upgrade kapan saja jika sudah siap.',
    popular: 'Terpopuler', free: 'Gratis',
    trust: ['Pembayaran aman & terverifikasi', 'Batalkan kapan saja', 'Toko aktif dalam 60 detik'],
    faqs: [
      { q: 'Bagaimana proses pembayaran subscription?', a: 'Setelah membuat toko, kamu akan mendapat instruksi transfer bank atau QRIS. Tim kami konfirmasi dalam 1×24 jam dan plan langsung aktif.' },
      { q: 'Bisa ganti plan nanti?', a: 'Ya, kamu bisa upgrade kapan saja dari dashboard. Downgrade berlaku di periode berikutnya.' },
      { q: 'Apakah bisa mencoba dulu sebelum bayar?', a: 'Tentu. Free Trial 7 hari memberi akses penuh ke semua fitur tanpa biaya dan tanpa perlu kartu kredit.' },
      { q: 'Apa yang terjadi jika trial habis?', a: 'Tokomu akan disuspend sementara. Customer tidak bisa mengakses, tapi semua data aman. Aktifkan kembali dengan upgrade plan.' },
    ],
    plans: [
      { id: 'free', name: 'Free Trial', price: 0, period: '7 hari', desc: 'Coba semua fitur tanpa risiko.', cta: 'Mulai Gratis', popular: false, highlight: false, features: ['Toko di subdomain sendiri', 'Onboarding via AI (60 detik)', 'AI Chatbot (10.000 token)', 'Checkout & QRIS', 'Notifikasi WhatsApp'] },
      { id: 'business', name: 'Business', price: 399000, period: '/bulan', desc: 'Untuk brand yang aktif berjualan.', cta: 'Berlangganan Business', popular: true, highlight: true, features: ['Semua fitur Free Trial', 'AI Chatbot 1 juta token/bulan', '1.000 pesanan/bulan', 'Analitik penjualan', 'Top-up pesanan kapan saja', 'WhatsApp support'] },
      { id: 'enterprise', name: 'Enterprise', price: 599000, period: '/bulan', desc: 'Untuk brand dengan volume tinggi.', cta: 'Berlangganan Enterprise', popular: false, highlight: false, features: ['Semua fitur Business', 'AI Chatbot 50 juta token/bulan', 'Pesanan tidak terbatas', 'Custom chatbot persona', 'Priority support'] },
    ],
  },
  en: {
    back: 'Back', compareLink: 'Compare all features →',
    badge: 'Choose the plan that fits your business',
    heading: 'Start with 7 Days Free',
    sub: 'Store live in 60 seconds. No credit card needed for trial. Upgrade anytime when ready.',
    popular: 'Most Popular', free: 'Free',
    trust: ['Secure & verified payment', 'Cancel anytime', 'Store active in 60 seconds'],
    faqs: [
      { q: 'How does subscription payment work?', a: 'After creating your store, you will receive bank transfer or QRIS instructions. Our team confirms within 1×24 hours and your plan activates immediately.' },
      { q: 'Can I change plans later?', a: 'Yes, you can upgrade anytime from the dashboard. Downgrades take effect in the next billing period.' },
      { q: 'Can I try before paying?', a: 'Of course. The 7-day Free Trial gives full access to all features with no cost and no credit card required.' },
      { q: 'What happens when the trial ends?', a: 'Your store will be temporarily suspended. Customers cannot access it, but all your data is safe. Reactivate by upgrading your plan.' },
    ],
    plans: [
      { id: 'free', name: 'Free Trial', price: 0, period: '7 days', desc: 'Try all features risk-free.', cta: 'Start Free', popular: false, highlight: false, features: ['Store on your own subdomain', 'AI-powered onboarding (60 sec)', 'AI Chatbot (10,000 tokens)', 'Checkout & QRIS', 'WhatsApp notifications'] },
      { id: 'business', name: 'Business', price: 399000, period: '/month', desc: 'For active selling brands.', cta: 'Subscribe Business', popular: true, highlight: true, features: ['All Free Trial features', 'AI Chatbot 1M tokens/month', '1,000 orders/month', 'Sales analytics', 'Order top-up anytime', 'WhatsApp support'] },
      { id: 'enterprise', name: 'Enterprise', price: 599000, period: '/month', desc: 'For high-volume brands.', cta: 'Subscribe Enterprise', popular: false, highlight: false, features: ['All Business features', 'AI Chatbot 50M tokens/month', 'Unlimited orders', 'Custom chatbot persona', 'Priority support'] },
    ],
  },
}

export function SubscribeContent({ slug }: { slug: string }) {
  const { lang, toggle } = useLang()
  const tx = T[lang]
  const slugParam = slug ? `&slug=${slug}` : ''

  const plans = tx.plans.map(p =>
    p.id === 'business' ? { ...p, href: `/subscribe/checkout?plan=business${slugParam}` }
    : p.id === 'enterprise' ? { ...p, href: `/subscribe/checkout?plan=enterprise${slugParam}` }
    : { ...p, href: '/onboarding' }
  )

  return (
    <div className="min-h-screen font-sans" style={{ background: SURFACE }}>
      {/* Navbar */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, background: 'white' }} className="sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium" style={{ color: TEXT_SEC }}>
            <ArrowLeft size={14} />{tx.back}
          </Link>
          <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <Link href="/pricing" className="text-sm" style={{ color: TEXT_SEC }}>{tx.compareLink}</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="mx-auto max-w-5xl px-6 pt-14 pb-10 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-5" style={{ background: `${GOLD}25`, color: '#8B6800' }}>
          <Zap size={12} />{tx.badge}
        </div>
        <h1 className="text-4xl font-bold" style={{ color: PRIMARY }}>{tx.heading}</h1>
        <p className="mt-3 text-base max-w-lg mx-auto" style={{ color: TEXT_SEC }}>{tx.sub}</p>
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p) => (
            <div key={p.id} className="rounded-2xl flex flex-col"
              style={{ background: p.highlight ? PRIMARY : 'white', border: p.highlight ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}` }}>
              <div className="p-7 flex flex-col gap-2">
                {p.popular && (
                  <span className="self-start text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: GOLD, color: '#1a1a1a' }}>
                    {tx.popular}
                  </span>
                )}
                <div className="text-sm font-medium" style={{ color: p.highlight ? 'rgba(255,255,255,0.6)' : TEXT_SEC }}>{p.name}</div>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-bold" style={{ color: p.highlight ? 'white' : PRIMARY }}>
                    {p.price === 0 ? tx.free : `Rp ${(p.price / 1000).toFixed(0)}k`}
                  </span>
                  {p.price > 0 && <span className="text-sm pb-0.5" style={{ color: p.highlight ? 'rgba(255,255,255,0.5)' : TEXT_SEC }}>{p.period}</span>}
                </div>
                <p className="text-sm" style={{ color: p.highlight ? 'rgba(255,255,255,0.6)' : TEXT_SEC }}>{p.desc}</p>
              </div>
              <div className="px-7 pb-6">
                <Link href={p.href} className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
                  style={{ background: p.highlight ? GOLD : PRIMARY, color: p.highlight ? '#1a1a1a' : 'white' }}>
                  {p.cta} <ChevronRight size={14} />
                </Link>
              </div>
              <div style={{ borderTop: `1px solid ${p.highlight ? 'rgba(255,255,255,0.12)' : BORDER}` }} />
              <div className="p-7 flex flex-col gap-3 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span style={{ color: p.highlight ? 'rgba(255,255,255,0.8)' : TEXT_SEC }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust signals */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm" style={{ color: TEXT_SEC }}>
          {([Shield, Check, Zap] as const).map((Icon, i) => (
            <div key={i} className="flex items-center gap-2">
              <span style={{ color: GOLD }}><Icon size={14} /></span>
              {tx.trust[i]}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-12 grid md:grid-cols-2 gap-4">
          {tx.faqs.map((f) => (
            <div key={f.q} className="rounded-xl p-5 bg-white" style={{ border: `1px solid ${BORDER}` }}>
              <div className="font-semibold text-sm mb-1.5" style={{ color: PRIMARY }}>{f.q}</div>
              <div className="text-sm leading-relaxed" style={{ color: TEXT_SEC }}>{f.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
