'use client'

import Link from 'next/link'
import { CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import { useLang, LangToggle } from '@/lib/lang'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'
const BORDER = '#E5EAF0'
const TEXT_SEC = '#5E6B85'
const SURFACE = '#F8FAFC'

const BANK_ACCOUNTS = [
  { bank: 'BCA', account: '1234567890', name: 'PT UMKMku Digital Indonesia' },
  { bank: 'BRI', account: '0987654321', name: 'PT UMKMku Digital Indonesia' },
]

const T = {
  id: {
    confirm: 'Konfirmasi dalam 1×24 jam',
    storeCreated: 'Toko berhasil dibuat! 🎉',
    completePayment: 'Selesaikan pembayaran untuk mengaktifkan plan',
    orderSummary: 'Ringkasan Pesanan',
    period: 'Periode', firstMonth: 'bulan pertama',
    store: 'Toko', total: 'Total',
    transferTitle: 'Transfer ke Salah Satu Rekening',
    accountName: 'a.n.',
    transferAmount: 'Jumlah transfer:',
    transferNote: 'Transfer tepat sesuai nominal di atas agar verifikasi lebih cepat.',
    nextSteps: 'Langkah Selanjutnya',
    stepTitles: ['Lakukan transfer', 'Simpan bukti transfer', 'Hubungi tim via WhatsApp', 'Plan aktif dalam 1×24 jam'],
    whatsapp: 'Konfirmasi via WhatsApp',
    viewDashboard: 'Lihat dashboard dulu',
    question: 'Ada pertanyaan? Email ke',
  },
  en: {
    confirm: 'Confirmation within 1×24 hours',
    storeCreated: 'Store created successfully! 🎉',
    completePayment: 'Complete payment to activate plan',
    orderSummary: 'Order Summary',
    period: 'Period', firstMonth: 'first month',
    store: 'Store', total: 'Total',
    transferTitle: 'Transfer to One of These Accounts',
    accountName: 'a/c:',
    transferAmount: 'Transfer amount:',
    transferNote: 'Transfer the exact amount above for faster verification.',
    nextSteps: 'Next Steps',
    stepTitles: ['Make the transfer', 'Save the receipt', 'Contact team via WhatsApp', 'Plan active within 1×24 hours'],
    whatsapp: 'Confirm via WhatsApp',
    viewDashboard: 'View dashboard first',
    question: 'Questions? Email us at',
  },
}

function CopyButton({ text }: { text: string }) {
  return (
    <button onClick={() => navigator.clipboard.writeText(text)}
      className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: `${PRIMARY}15`, color: PRIMARY }}>
      Copy
    </button>
  )
}

export function PaymentContent({ planName, planPrice, slug }: { planName: string; planPrice: number; slug: string }) {
  const { lang, toggle } = useLang()
  const tx = T[lang]

  const stepDescs = [
    `${lang === 'id' ? 'Transfer' : 'Transfer'} Rp ${planPrice.toLocaleString('id-ID')} ${lang === 'id' ? 'ke salah satu rekening di atas.' : 'to one of the accounts above.'}`,
    lang === 'id' ? 'Screenshot atau foto struk transfer kamu.' : 'Screenshot or photo of your transfer confirmation.',
    lang === 'id' ? 'Kirim bukti transfer ke WhatsApp tim UMKMku untuk konfirmasi.' : 'Send the transfer proof to the UMKMku WhatsApp team for confirmation.',
    lang === 'id' ? 'Setelah dikonfirmasi, plan langsung aktif dan toko bisa diakses.' : 'After confirmation, your plan is immediately active and store accessible.',
  ]

  return (
    <div className="min-h-screen font-sans" style={{ background: SURFACE }}>
      {/* Navbar */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, background: 'white' }} className="sticky top-0 z-50">
        <div className="mx-auto max-w-2xl px-6 flex items-center justify-between h-16">
          <Link href="/"><img src="/logo.png" alt="UMKMu" style={{ height: '32px', width: 'auto' }} /></Link>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} toggle={toggle} />
            <div className="flex items-center gap-2 text-sm" style={{ color: TEXT_SEC }}>
              <Clock size={14} />{tx.confirm}
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Status header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: `${GOLD}25` }}>
            <CheckCircle2 size={32} style={{ color: GOLD }} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>{tx.storeCreated}</h1>
          <p className="mt-2 text-sm" style={{ color: TEXT_SEC }}>
            {tx.completePayment} <strong>{planName}</strong>.
          </p>
        </div>

        {/* Order summary */}
        <div className="rounded-2xl bg-white p-6 mb-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="text-sm font-semibold mb-4" style={{ color: PRIMARY }}>{tx.orderSummary}</div>
          <div className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <span className="text-sm" style={{ color: TEXT_SEC }}>Plan {planName}</span>
            <span className="text-sm font-medium" style={{ color: PRIMARY }}>Rp {planPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
            <span className="text-sm" style={{ color: TEXT_SEC }}>{tx.period}</span>
            <span className="text-sm" style={{ color: TEXT_SEC }}>{tx.firstMonth}</span>
          </div>
          {slug && (
            <div className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${BORDER}` }}>
              <span className="text-sm" style={{ color: TEXT_SEC }}>{tx.store}</span>
              <span className="text-sm font-medium" style={{ color: PRIMARY }}>{slug}.umkmku.com</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-4">
            <span className="font-bold" style={{ color: PRIMARY }}>{tx.total}</span>
            <span className="text-xl font-bold" style={{ color: PRIMARY }}>Rp {planPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Bank accounts */}
        <div className="rounded-2xl bg-white p-6 mb-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="text-sm font-semibold mb-5" style={{ color: PRIMARY }}>{tx.transferTitle}</div>
          <div className="flex flex-col gap-4">
            {BANK_ACCOUNTS.map((acc) => (
              <div key={acc.bank} className="rounded-xl p-4 flex items-center justify-between" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
                <div>
                  <div className="font-bold text-sm" style={{ color: PRIMARY }}>{acc.bank}</div>
                  <div className="text-lg font-mono font-bold mt-0.5" style={{ color: PRIMARY }}>{acc.account}</div>
                  <div className="text-xs mt-0.5" style={{ color: TEXT_SEC }}>{tx.accountName} {acc.name}</div>
                </div>
                <CopyButton text={acc.account} />
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl p-4" style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}40` }}>
            <p className="text-sm font-semibold" style={{ color: '#8B6800' }}>
              {tx.transferAmount} Rp {planPrice.toLocaleString('id-ID')}
            </p>
            <p className="text-xs mt-1" style={{ color: '#8B6800' }}>{tx.transferNote}</p>
          </div>
        </div>

        {/* Next steps */}
        <div className="rounded-2xl bg-white p-6 mb-6" style={{ border: `1px solid ${BORDER}` }}>
          <div className="text-sm font-semibold mb-5" style={{ color: PRIMARY }}>{tx.nextSteps}</div>
          <div className="flex flex-col gap-5">
            {tx.stepTitles.map((title, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: PRIMARY }}>
                  {idx + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: PRIMARY }}>{title}</div>
                  <div className="text-sm mt-0.5" style={{ color: TEXT_SEC }}>{stepDescs[idx]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* WhatsApp CTA */}
        <a
          href={`https://wa.me/6281234567890?text=${encodeURIComponent(`Halo UMKMku, saya sudah transfer untuk plan ${planName}${slug ? ` (toko: ${slug})` : ''}, mohon dikonfirmasi.`)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 mb-4"
          style={{ background: '#25D366', color: 'white' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {tx.whatsapp}
        </a>

        {slug && (
          <Link href={`/${slug}`} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-75"
            style={{ color: TEXT_SEC, border: `1px solid ${BORDER}`, background: 'white' }}>
            {tx.viewDashboard} <ArrowRight size={14} />
          </Link>
        )}

        <p className="text-center text-xs mt-6" style={{ color: TEXT_SEC }}>
          {tx.question}{' '}<a href="mailto:halo@umkmku.com" className="underline">halo@umkmku.com</a>
        </p>
      </div>
    </div>
  )
}
