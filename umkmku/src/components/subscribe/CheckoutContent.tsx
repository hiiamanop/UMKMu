'use client'

import Link from 'next/link'
import { ArrowLeft, Shield, Zap } from 'lucide-react'
import { useLang, LangToggle } from '@/lib/lang'
import { CheckoutForm } from '@/app/subscribe/checkout/_checkout-form'
import { formatRupiah } from '@/lib/utils/pricing'
import type { PricingBreakdown } from '@/lib/utils/pricing'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const T = {
  id: {
    backBtn: 'Pilih Plan Lain', secureLabel: 'Pembayaran aman via payment gateway',
    orderSummary: 'Ringkasan Pesanan', monthly: 'Langganan bulanan · Aktif setelah pembayaran',
    youGet: 'Yang kamu dapatkan:',
    baseFeatures: ['Toko di subdomain sendiri', 'Onboarding via AI (60 detik)', 'Checkout & QRIS', 'Notifikasi WhatsApp otomatis'],
    priceBreakdown: 'Rincian Harga', planPrice: 'Harga plan', ppn: 'PPN (12%)', total: 'Total yang dibayar',
    priceNote: 'Harga sudah termasuk PPN 12%. Tidak ada biaya tambahan untuk pembayaran QRIS.',
    ssl: 'SSL terenkripsi', instant: 'Aktif instan setelah bayar',
    businessFeatures: ['AI Chatbot 1 juta token/bulan', '1.000 pesanan/bulan', 'Analitik penjualan', 'WhatsApp support'],
    enterpriseFeatures: ['AI Chatbot 50 juta token/bulan', 'Pesanan tidak terbatas', 'Custom chatbot persona', 'Priority support'],
  },
  en: {
    backBtn: 'Choose Another Plan', secureLabel: 'Secure payment via payment gateway',
    orderSummary: 'Order Summary', monthly: 'Monthly subscription · Active after payment',
    youGet: "What you'll get:",
    baseFeatures: ['Store on your own subdomain', 'AI-powered onboarding (60 sec)', 'Checkout & QRIS', 'Automatic WhatsApp notifications'],
    priceBreakdown: 'Price Breakdown', planPrice: 'Plan price', ppn: 'VAT (12%)', total: 'Total to pay',
    priceNote: 'Price includes 12% VAT. No additional fee for QRIS payment.',
    ssl: 'SSL encrypted', instant: 'Activates instantly after payment',
    businessFeatures: ['AI Chatbot 1M tokens/month', '1,000 orders/month', 'Sales analytics', 'WhatsApp support'],
    enterpriseFeatures: ['AI Chatbot 50M tokens/month', 'Unlimited orders', 'Custom chatbot persona', 'Priority support'],
  },
}

const PLAN_FEATURES: Record<string, (tx: typeof T['id']) => string[]> = {
  business: (tx) => tx.businessFeatures,
  enterprise: (tx) => tx.enterpriseFeatures,
}

interface Props {
  plan: { id: string; name: string; price: number }
  pricing: PricingBreakdown
  slug?: string
}

export function CheckoutContent({ plan, pricing, slug }: Props) {
  const { lang, toggle } = useLang()
  const tx = T[lang]
  const planFeatures = PLAN_FEATURES[plan.id]?.(tx) ?? []

  return (
    <div className="min-h-screen font-sans" style={{ background: '#F8FAFC' }}>
      {/* Navbar */}
      <nav className="bg-white sticky top-0 z-50" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="mx-auto max-w-5xl px-6 flex items-center justify-between h-16">
          <Link href="/subscribe" className="flex items-center gap-2 text-sm font-medium" style={{ color: TEXT_SEC }}>
            <ArrowLeft size={14} />{tx.backBtn}
          </Link>
          <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <div className="flex items-center gap-1.5 text-xs" style={{ color: TEXT_SEC }}>
              <Shield size={13} style={{ color: GOLD }} />
              <span className="hidden sm:inline">{tx.secureLabel}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-6 py-12 grid md:grid-cols-2 gap-8 items-start">
        {/* Left: Order summary */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: TEXT_SEC }}>{tx.orderSummary}</div>
            <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>UMKMku {plan.name}</h1>
            <p className="text-sm mt-1" style={{ color: TEXT_SEC }}>{tx.monthly}</p>
          </div>

          {/* Plan features */}
          <div className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${BORDER}` }}>
            <div className="text-xs font-semibold mb-3" style={{ color: TEXT_SEC }}>{tx.youGet}</div>
            <div className="flex flex-col gap-2">
              {[...tx.baseFeatures, ...planFeatures].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm" style={{ color: TEXT_SEC }}>
                  <span style={{ color: GOLD }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="bg-white rounded-2xl p-5" style={{ border: `1px solid ${BORDER}` }}>
            <div className="text-xs font-semibold mb-4" style={{ color: TEXT_SEC }}>{tx.priceBreakdown}</div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: TEXT_SEC }}>{tx.planPrice} {plan.name}</span>
                <span style={{ color: PRIMARY }}>{formatRupiah(pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: TEXT_SEC }}>{tx.ppn}</span>
                <span style={{ color: TEXT_SEC }}>{formatRupiah(pricing.ppn)}</span>
              </div>
              <div className="flex justify-between pt-3 mt-1" style={{ borderTop: `1px solid ${BORDER}` }}>
                <span className="font-bold" style={{ color: PRIMARY }}>{tx.total}</span>
                <span className="text-xl font-bold" style={{ color: PRIMARY }}>{formatRupiah(pricing.finalPrice)}</span>
              </div>
            </div>
            <p className="text-xs mt-3" style={{ color: TEXT_SEC }}>{tx.priceNote}</p>
          </div>

          {/* Trust */}
          <div className="flex gap-4 text-xs" style={{ color: TEXT_SEC }}>
            <div className="flex items-center gap-1.5"><Shield size={12} style={{ color: GOLD }} />{tx.ssl}</div>
            <div className="flex items-center gap-1.5"><Zap size={12} style={{ color: GOLD }} />{tx.instant}</div>
          </div>
        </div>

        {/* Right: Form */}
        <CheckoutForm plan={plan} pricing={pricing} slug={slug} lang={lang} />
      </div>
    </div>
  )
}
