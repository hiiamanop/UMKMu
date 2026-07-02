'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, TrendingUp, MessageCircle, Bell, ShoppingBag, Star, ChevronRight } from 'lucide-react'
import { LandingChat } from './LandingChat'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const SURFACE = '#F8FAFC'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const T = {
  id: {
    nav: { features: 'Fitur', success: 'Kisah Sukses', pricing: 'Harga', insight: 'Insight', templates: 'Templates', subscribe: 'Berlangganan', start: 'Mulai Gratis' },
    hero: {
      badge: 'Platform e-commerce #1 untuk UMKM Indonesia',
      title: ['Toko Online Sendiri,', 'Tanpa Ketergantungan', 'Marketplace'],
      desc: 'Bangun toko digital brand kamu dalam 60 detik. AI yang onboarding, chatbot yang jualan, notif WhatsApp otomatis, semua dalam satu platform.',
      cta: 'Mulai Gratis 7 Hari',
      sub: 'Tanpa kartu kredit. Toko live dalam 60 detik.',
      stats: [
        { value: '2.000+', label: 'Merchant aktif' },
        { value: 'Rp 4,2M', label: 'Rata-rata revenue/bulan' },
        { value: '60 detik', label: 'Toko live dari onboarding' },
      ],
    },
    features: {
      heading: 'Semua yang Kamu Butuhkan',
      sub: 'Satu platform, semua fitur untuk jualan online',
      main: [
        { title: 'Toko di Subdomain Sendiri', desc: 'nama-brand.umkmu.site, toko kamu, data kamu, pelanggan kamu. Tidak lagi bergantung algoritma marketplace.' },
        { title: 'AI Chatbot Penjualan', desc: 'Chatbot AI merekomendasikan produk yang tepat ke customer, 24/7, tanpa kamu perlu online.' },
        { title: 'Notifikasi WhatsApp Otomatis', desc: 'Customer dan merchant dapat notif WA real-time, pesanan baru, pembayaran, pengiriman, semua otomatis.' },
      ],
      secondary: [
        { title: 'Checkout & Pembayaran QRIS', desc: 'Customer bisa checkout, bayar QRIS, dan lacak pesanan, semua di toko kamu.' },
        { title: 'Verifikasi Pembayaran via AI', desc: 'Upload bukti bayar, AI langsung verifikasi otomatis. Tidak perlu cek manual.' },
        { title: 'Manajemen Pesanan Lengkap', desc: 'Dashboard kelola pesanan, update status, kirim notif, dari satu tempat.' },
        { title: 'Onboarding via AI', desc: 'Ceritakan bisnismu, AI langsung buat toko dan isi produk. Tidak perlu coding.' },
      ],
    },
    steps: {
      heading: 'Toko Live dalam 3 Langkah',
      sub: 'Dari cerita ke toko online, kurang dari 5 menit',
      items: [
        { step: '01', title: 'Ceritakan bisnismu', desc: 'Ketik atau ceritakan brand, produk, dan visimu ke AI UMKMu.' },
        { step: '02', title: 'AI buat tokomu', desc: 'Dalam hitungan detik, toko dengan subdomain, produk, dan chatbot sudah siap.' },
        { step: '03', title: 'Mulai terima pesanan', desc: 'Share link toko, customer bisa langsung browse, chat, checkout, dan bayar.' },
      ],
    },
    testimonials: {
      heading: 'Kisah Sukses Merchant',
      sub: 'Brand lokal yang sudah buktikan hasilnya',
      items: [
        { name: 'Sari Dewi', brand: 'Glow Skincare', quote: 'Sebelumnya pelanggan repeat buyer sering hilang karena tidak punya cara kontak mereka langsung. Sekarang semua data ada di tangan saya.', metric: '+230% repeat buyer' },
        { name: 'Budi Santoso', brand: 'Aroma Nusantara', quote: 'Toko online saya jadi dalam 3 menit. Chatbot-nya bisa jelasin produk parfum saya lebih baik dari saya sendiri.', metric: '3 menit toko live' },
        { name: 'Rina Maharani', brand: 'Batik Mahkota', quote: 'Notifikasi WhatsApp otomatis bikin saya tidak ketinggalan satu pun pesanan. Customer pun merasa lebih terlayani.', metric: '0 pesanan terlewat' },
      ],
    },
    pricing: {
      heading: 'Mulai Gratis, Bayar Sesuai Pertumbuhan',
      sub: '7 hari trial penuh, tidak perlu kartu kredit',
      popular: 'Terpopuler',
      footnote: 'Butuh lebih banyak pesanan? Top-up kapan saja,',
      footnoteHighlight: 'Rp 10.000 untuk 50 pesanan tambahan',
      compare: 'Lihat perbandingan lengkap →',
      plans: [
        {
          name: 'Free Trial', price: 'Rp 0', period: '7 hari', desc: 'Coba semua fitur tanpa risiko',
          cta: 'Mulai Gratis', href: '/onboarding', popular: false,
          features: ['Toko di subdomain sendiri', 'AI onboarding', 'Chatbot AI (10.000 token)', 'Manajemen pesanan', 'Notifikasi WhatsApp'],
        },
        {
          name: 'Business', price: 'Rp 399.000', period: '/bulan', desc: 'Untuk brand yang sudah aktif berjualan',
          cta: 'Pilih Business', href: '/subscribe/checkout?plan=business', popular: true,
          features: ['Semua fitur Free', 'AI Chatbot 1.000.000 token', '1.000 pesanan/bulan', 'Verifikasi pembayaran AI', 'Analitik penjualan', 'Top-up pesanan Rp 10k/50 pesanan'],
        },
        {
          name: 'Enterprise', price: 'Rp 599.000', period: '/bulan', desc: 'Untuk brand dengan volume tinggi',
          cta: 'Pilih Enterprise', href: '/subscribe/checkout?plan=enterprise', popular: false,
          features: ['Semua fitur Business', 'AI Chatbot 50 juta token', 'Pesanan tidak terbatas', 'Priority support', 'Custom chatbot persona'],
        },
      ],
    },
    cta: {
      heading: ['Siap Punya Toko Online', 'yang Benar-Benar Milikmu?'],
      desc: '7 hari gratis. Toko live dalam 60 detik. Tidak ada yang perlu diinstal.',
      button: 'Mulai Gratis Sekarang',
    },
    footer: {
      tagline: 'Platform web & marketplace builder untuk UMKM lokal Indonesia. Tokomu, datamu, pelangganmu.',
      product: 'Produk', ecosystem: 'Ekosistem', legal: 'Legal',
      features: 'Fitur', pricing: 'Harga', onboarding: 'Onboarding AI',
      partner: 'Jadi Template Partner', templates: 'Gallery Template', insight: 'Insight & Blog',
      privacy: 'Privasi', terms: 'Syarat & Ketentuan',
      copy: '© 2026 UMKMu.site · Dibuat dengan ❤️ untuk UMKM Indonesia',
    },
  },
  en: {
    nav: { features: 'Features', success: 'Success Stories', pricing: 'Pricing', insight: 'Insight', templates: 'Templates', subscribe: 'Subscribe', start: 'Start Free' },
    hero: {
      badge: '#1 E-commerce Platform for Indonesian SMEs',
      title: ['Your Own Online Store,', 'Independent from', 'Marketplaces'],
      desc: "Build your brand's digital store in 60 seconds. AI onboarding, sales chatbot, automatic WhatsApp notifications, all in one platform.",
      cta: 'Start Free for 7 Days',
      sub: 'No credit card. Store live in 60 seconds.',
      stats: [
        { value: '2,000+', label: 'Active merchants' },
        { value: 'Rp 4.2M', label: 'Average revenue/month' },
        { value: '60 seconds', label: 'Store live from onboarding' },
      ],
    },
    features: {
      heading: 'Everything You Need',
      sub: 'One platform, all features for selling online',
      main: [
        { title: 'Store on Your Own Subdomain', desc: 'your-brand.umkmu.site, your store, your data, your customers. No more depending on marketplace algorithms.' },
        { title: 'AI Sales Chatbot', desc: 'AI Chatbot recommends the right products to customers, 24/7, without you needing to be online.' },
        { title: 'Automatic WhatsApp Notifications', desc: 'Customers and merchants get real-time WA notifications for new orders, payments, and shipping, all automatic.' },
      ],
      secondary: [
        { title: 'QRIS Checkout & Payment', desc: 'Customers can checkout, pay via QRIS, and track orders, all in your store.' },
        { title: 'AI Payment Verification', desc: 'Upload proof of payment, AI verifies automatically. No manual checking needed.' },
        { title: 'Complete Order Management', desc: 'Dashboard to manage orders, update status, send notifications, from one place.' },
        { title: 'AI-powered Onboarding', desc: 'Tell us about your business, AI instantly creates your store and fills in products. No coding needed.' },
      ],
    },
    steps: {
      heading: 'Store Live in 3 Steps',
      sub: 'From idea to online store, in under 5 minutes',
      items: [
        { step: '01', title: 'Tell us about your business', desc: 'Type or describe your brand, products, and vision to UMKMu AI.' },
        { step: '02', title: 'AI builds your store', desc: 'In seconds, a store with subdomain, products, and chatbot is ready.' },
        { step: '03', title: 'Start receiving orders', desc: 'Share your store link, customers can browse, chat, checkout, and pay.' },
      ],
    },
    testimonials: {
      heading: 'Merchant Success Stories',
      sub: 'Local brands that have proven the results',
      items: [
        { name: 'Sari Dewi', brand: 'Glow Skincare', quote: 'Before, repeat buyers often disappeared because I had no way to contact them directly. Now all the data is in my hands.', metric: '+230% repeat buyers' },
        { name: 'Budi Santoso', brand: 'Aroma Nusantara', quote: 'My online store was live in 3 minutes. The chatbot explains my perfume products better than I can.', metric: 'Store live in 3 min' },
        { name: 'Rina Maharani', brand: 'Batik Mahkota', quote: 'Automatic WhatsApp notifications mean I never miss a single order. Customers also feel better served.', metric: '0 missed orders' },
      ],
    },
    pricing: {
      heading: 'Start Free, Pay as You Grow',
      sub: '7-day full trial, no credit card required',
      popular: 'Most Popular',
      footnote: 'Need more orders? Top-up anytime,',
      footnoteHighlight: 'Rp 10,000 for 50 additional orders',
      compare: 'See full comparison →',
      plans: [
        {
          name: 'Free Trial', price: 'Rp 0', period: '7 days', desc: 'Try all features risk-free',
          cta: 'Start Free', href: '/onboarding', popular: false,
          features: ['Store on your own subdomain', 'AI onboarding', 'AI Chatbot (10,000 tokens)', 'Order management', 'WhatsApp notifications'],
        },
        {
          name: 'Business', price: 'Rp 399,000', period: '/month', desc: 'For brands actively selling',
          cta: 'Choose Business', href: '/subscribe/checkout?plan=business', popular: true,
          features: ['All Free features', 'AI Chatbot 1,000,000 tokens', '1,000 orders/month', 'AI payment verification', 'Sales analytics', 'Top-up orders Rp 10k/50 orders'],
        },
        {
          name: 'Enterprise', price: 'Rp 599,000', period: '/month', desc: 'For high-volume brands',
          cta: 'Choose Enterprise', href: '/subscribe/checkout?plan=enterprise', popular: false,
          features: ['All Business features', 'AI Chatbot 50 million tokens', 'Unlimited orders', 'Priority support', 'Custom chatbot persona'],
        },
      ],
    },
    cta: {
      heading: ['Ready to Own an Online Store', "That's Truly Yours?"],
      desc: '7 days free. Store live in 60 seconds. Nothing to install.',
      button: 'Start Free Now',
    },
    footer: {
      tagline: 'Web & marketplace builder platform for local Indonesian SMEs. Your store, your data, your customers.',
      product: 'Product', ecosystem: 'Ecosystem', legal: 'Legal',
      features: 'Features', pricing: 'Pricing', onboarding: 'AI Onboarding',
      partner: 'Become a Template Partner', templates: 'Template Gallery', insight: 'Insight & Blog',
      privacy: 'Privacy', terms: 'Terms & Conditions',
      copy: '© 2026 UMKMu.site · Made with ❤️ for Indonesian SMEs',
    },
  },
}

const icons = [<ShoppingBag key="bag" size={22} />, <MessageCircle key="msg" size={22} />, <Bell key="bell" size={22} />]

export function LandingContent() {
  const [lang, setLang] = useState<'id' | 'en'>('id')

  useEffect(() => {
    const saved = localStorage.getItem('lang')
    if (saved === 'en') setLang('en')
  }, [])

  const toggle = () => {
    const next = lang === 'id' ? 'en' : 'id'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  const tx = T[lang]

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav style={{ borderBottom: `1px solid ${BORDER}` }} className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between h-16">
          <img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: TEXT_SEC }}>
            <Link href="#fitur" className="hover:text-[#0A2F73] transition-colors">{tx.nav.features}</Link>
            <Link href="#testimoni" className="hover:text-[#0A2F73] transition-colors">{tx.nav.success}</Link>
            <Link href="/pricing" className="hover:text-[#0A2F73] transition-colors">{tx.nav.pricing}</Link>
            <Link href="/insight" className="hover:text-[#0A2F73] transition-colors">{tx.nav.insight}</Link>
            <Link href="/templates" className="hover:text-[#0A2F73] transition-colors">{tx.nav.templates}</Link>
          </div>
          <div className="flex items-center gap-3">
            {/* Desktop: left of Berlangganan | Mobile: Berlangganan hidden → left of Mulai Gratis */}
            <button
              onClick={toggle}
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 transition-colors"
            >
              {lang === 'id' ? '🇮🇩' : '🇬🇧'}
            </button>
            <Link href="/subscribe" className="hidden sm:inline-flex text-sm font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-90" style={{ background: GOLD, color: '#1a1a1a' }}>
              {tx.nav.subscribe}
            </Link>
            <Link href="/onboarding" className="text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90" style={{ background: PRIMARY }}>
              {tx.nav.start}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: `${GOLD}22`, color: '#8B6800' }}>
            <TrendingUp size={14} />
            {tx.hero.badge}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight max-w-3xl" style={{ color: PRIMARY }}>
            {tx.hero.title[0]}<br />
            <span style={{ color: GOLD }}>{tx.hero.title[1]}</span><br />
            {tx.hero.title[2]}
          </h1>
          <p className="text-lg max-w-xl leading-relaxed" style={{ color: TEXT_SEC }}>{tx.hero.desc}</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
            <Link href="/onboarding" className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-base transition-opacity hover:opacity-90" style={{ background: PRIMARY }}>
              {tx.hero.cta} <ArrowRight size={16} />
            </Link>
            <span className="text-sm" style={{ color: TEXT_SEC }}>{tx.hero.sub}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-8 mt-10 pt-10" style={{ borderTop: `1px solid ${BORDER}` }}>
            {tx.hero.stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: PRIMARY }}>{s.value}</div>
                <div className="text-sm mt-1" style={{ color: TEXT_SEC }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" style={{ background: SURFACE }} className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold" style={{ color: PRIMARY }}>{tx.features.heading}</h2>
            <p className="mt-3 text-base" style={{ color: TEXT_SEC }}>{tx.features.sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tx.features.main.map((f, i) => (
              <div key={f.title} className="bg-white rounded-2xl p-7 flex flex-col gap-4" style={{ border: `1px solid ${BORDER}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: PRIMARY }}>{icons[i]}</div>
                <h3 className="font-semibold text-base" style={{ color: PRIMARY }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC }}>{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {tx.features.secondary.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 flex gap-4" style={{ border: `1px solid ${BORDER}` }}>
                <Check size={18} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                <div>
                  <div className="font-semibold text-sm" style={{ color: PRIMARY }}>{f.title}</div>
                  <div className="text-sm mt-1" style={{ color: TEXT_SEC }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold" style={{ color: PRIMARY }}>{tx.steps.heading}</h2>
          <p className="mt-3 text-base" style={{ color: TEXT_SEC }}>{tx.steps.sub}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {tx.steps.items.map((s) => (
            <div key={s.step} className="flex flex-col gap-4">
              <div className="text-4xl font-bold" style={{ color: GOLD }}>{s.step}</div>
              <h3 className="text-lg font-semibold" style={{ color: PRIMARY }}>{s.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_SEC }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" style={{ background: SURFACE }} className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold" style={{ color: PRIMARY }}>{tx.testimonials.heading}</h2>
            <p className="mt-3 text-base" style={{ color: TEXT_SEC }}>{tx.testimonials.sub}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tx.testimonials.items.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-7 flex flex-col gap-4" style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={GOLD} style={{ color: GOLD }} />)}
                </div>
                <p className="text-sm leading-relaxed italic" style={{ color: TEXT_SEC }}>&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto">
                  <div className="font-semibold text-sm" style={{ color: PRIMARY }}>{t.name}</div>
                  <div className="text-xs" style={{ color: TEXT_SEC }}>{t.brand}</div>
                  <div className="mt-2 text-xs font-semibold px-3 py-1 rounded-full inline-block" style={{ background: `${GOLD}22`, color: '#8B6800' }}>{t.metric}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-20 mx-auto max-w-6xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold" style={{ color: PRIMARY }}>{tx.pricing.heading}</h2>
          <p className="mt-3 text-base" style={{ color: TEXT_SEC }}>{tx.pricing.sub}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {tx.pricing.plans.map((p) => (
            <div key={p.name} className="rounded-2xl p-7 flex flex-col gap-5" style={{ border: p.popular ? `2px solid ${PRIMARY}` : `1px solid ${BORDER}`, background: p.popular ? PRIMARY : 'white' }}>
              {p.popular && (
                <div className="text-xs font-bold px-3 py-1 rounded-full self-start" style={{ background: GOLD, color: '#1a1a1a' }}>{tx.pricing.popular}</div>
              )}
              <div>
                <div className="text-sm font-medium" style={{ color: p.popular ? 'rgba(255,255,255,0.7)' : TEXT_SEC }}>{p.name}</div>
                <div className="text-3xl font-bold mt-1" style={{ color: p.popular ? 'white' : PRIMARY }}>{p.price}</div>
                <div className="text-sm" style={{ color: p.popular ? 'rgba(255,255,255,0.6)' : TEXT_SEC }}>{p.period} · {p.desc}</div>
              </div>
              <div className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span style={{ color: p.popular ? 'rgba(255,255,255,0.85)' : TEXT_SEC }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href={p.href} className="mt-auto flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: p.popular ? GOLD : PRIMARY, color: p.popular ? '#1a1a1a' : 'white' }}>
                {p.cta} <ChevronRight size={14} />
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm mt-6" style={{ color: TEXT_SEC }}>
          {tx.pricing.footnote} <strong>{tx.pricing.footnoteHighlight}</strong>.{' '}
          <Link href="/pricing" className="underline font-medium" style={{ color: PRIMARY }}>{tx.pricing.compare}</Link>
        </p>
      </section>

      {/* Final CTA */}
      <section className="py-20" style={{ background: PRIMARY }}>
        <div className="mx-auto max-w-3xl px-6 text-center flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {tx.cta.heading[0]}<br />
            <span style={{ color: GOLD }}>{tx.cta.heading[1]}</span>
          </h2>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.7)' }}>{tx.cta.desc}</p>
          <Link href="/onboarding" className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-opacity hover:opacity-90" style={{ background: GOLD, color: '#1a1a1a' }}>
            {tx.cta.button} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#06183D', borderTop: `1px solid rgba(255,255,255,0.08)` }} className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="flex flex-col gap-3 max-w-xs">
              <img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} className="self-start" />
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.tagline}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-white">{tx.footer.product}</div>
                <Link href="#fitur" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.features}</Link>
                <Link href="/pricing" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.pricing}</Link>
                <Link href="/onboarding" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.onboarding}</Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-white">{tx.footer.ecosystem}</div>
                <Link href="/freelancer/register" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.partner}</Link>
                <Link href="/templates" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.templates}</Link>
                <Link href="/insight" className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.insight}</Link>
              </div>
              <div className="flex flex-col gap-3">
                <div className="text-sm font-semibold text-white">{tx.footer.legal}</div>
                <Link href="/privacy" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.privacy}</Link>
                <Link href="/terms" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>{tx.footer.terms}</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 text-sm" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
            {tx.footer.copy}
          </div>
        </div>
      </footer>

      <LandingChat />
    </div>
  )
}
