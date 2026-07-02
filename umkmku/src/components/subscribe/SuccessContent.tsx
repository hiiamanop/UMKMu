'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react'
import { useLang, LangToggle } from '@/lib/lang'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'

const PLAN_NAMES: Record<string, string> = { business: 'Business', enterprise: 'Enterprise' }

const T = {
  id: {
    paidTitle: 'Pembayaran Berhasil!',
    pendingTitle: 'Pembayaran Sedang Diverifikasi',
    paidDesc: (name: string, plan: string) => `Terima kasih, ${name}! Plan ${plan} kamu sudah aktif.`,
    pendingDesc: (email: string) => `Pembayaran dari ${email} sedang kami verifikasi. Biasanya selesai dalam 1–5 menit.`,
    plan: 'Plan', email: 'Email', totalPaid: 'Total dibayar', status: 'Status',
    paid: '✓ Lunas', pending: '⏳ Menunggu konfirmasi',
    nextSteps: 'Langkah selanjutnya:',
    steps: (plan: string) => [
      'Buat akun UMKMku dengan email yang sama',
      'Ceritakan bisnis kamu, AI akan buat toko dalam 60 detik',
      `Toko langsung aktif dengan plan ${plan}`,
    ],
    ctaBtn: 'Buat Toko Sekarang',
    alreadyAccount: 'Sudah punya akun?',
    loginHere: 'Login di sini',
  },
  en: {
    paidTitle: 'Payment Successful!',
    pendingTitle: 'Payment Being Verified',
    paidDesc: (name: string, plan: string) => `Thank you, ${name}! Your ${plan} plan is now active.`,
    pendingDesc: (email: string) => `Payment from ${email} is being verified. Usually done in 1–5 minutes.`,
    plan: 'Plan', email: 'Email', totalPaid: 'Total paid', status: 'Status',
    paid: '✓ Paid', pending: '⏳ Awaiting confirmation',
    nextSteps: 'Next steps:',
    steps: (plan: string) => [
      'Create a UMKMku account with the same email',
      'Tell us about your business, AI will build your store in 60 seconds',
      `Store activates immediately with the ${plan} plan`,
    ],
    ctaBtn: 'Create Your Store Now',
    alreadyAccount: 'Already have an account?',
    loginHere: 'Login here',
  },
}

interface Invoice {
  id: string
  plan_id: string
  email: string
  full_name: string | null
  status: string
  final_amount: number
}

export function SuccessContent({ invoice, isPaid }: { invoice: Invoice; isPaid: boolean }) {
  const { lang, toggle } = useLang()
  const tx = T[lang]
  const planName = PLAN_NAMES[invoice.plan_id] ?? invoice.plan_id

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ background: '#F8FAFC' }}>

      <div className="mb-12 flex items-center gap-3">
        <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
        <LangToggle lang={lang} toggle={toggle} />
      </div>

      <div className="w-full max-w-md text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: isPaid ? '#f0fdf4' : '#fef9c3' }}>
          <CheckCircle2 size={38} className={isPaid ? 'text-green-500' : 'text-yellow-500'} />
        </div>

        <div>
          <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>
            {isPaid ? tx.paidTitle : tx.pendingTitle}
          </h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: TEXT_SEC }}>
            {isPaid
              ? tx.paidDesc(invoice.full_name ?? invoice.email, planName)
              : tx.pendingDesc(invoice.email)}
          </p>
        </div>

        {/* Detail */}
        <div className="w-full rounded-2xl p-5 text-sm text-left flex flex-col gap-3" style={{ background: 'white', border: `1px solid ${BORDER}` }}>
          <div className="flex justify-between">
            <span style={{ color: TEXT_SEC }}>{tx.plan}</span>
            <span className="font-semibold" style={{ color: PRIMARY }}>{planName}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: TEXT_SEC }}>{tx.email}</span>
            <span style={{ color: PRIMARY }}>{invoice.email}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: TEXT_SEC }}>{tx.totalPaid}</span>
            <span className="font-semibold" style={{ color: PRIMARY }}>Rp {invoice.final_amount.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: TEXT_SEC }}>{tx.status}</span>
            <span className="font-semibold text-xs px-2.5 py-1 rounded-full"
              style={isPaid ? { background: '#f0fdf4', color: '#166534' } : { background: '#fef9c3', color: '#854d0e' }}>
              {isPaid ? tx.paid : tx.pending}
            </span>
          </div>
        </div>

        {/* Next steps */}
        <div className="w-full rounded-2xl p-5 text-left" style={{ background: `${PRIMARY}08`, border: `1px solid ${PRIMARY}20` }}>
          <div className="text-xs font-semibold mb-3" style={{ color: PRIMARY }}>{tx.nextSteps}</div>
          <div className="flex flex-col gap-2.5">
            {tx.steps(planName).map((s, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm" style={{ color: TEXT_SEC }}>
                <span className="font-bold shrink-0 mt-0.5" style={{ color: GOLD }}>{i + 1}.</span> {s}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href={`/onboarding?plan=${invoice.plan_id}&invoice=${invoice.id}`}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90"
          style={{ background: PRIMARY, color: 'white' }}>
          <Sparkles size={16} />{tx.ctaBtn}<ArrowRight size={16} />
        </Link>

        <p className="text-xs" style={{ color: TEXT_SEC }}>
          {tx.alreadyAccount}{' '}
          <Link href="/login" className="underline" style={{ color: PRIMARY }}>{tx.loginHere}</Link>
        </p>
      </div>
    </div>
  )
}
