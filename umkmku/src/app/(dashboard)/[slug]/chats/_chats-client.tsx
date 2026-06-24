'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MessageSquare, ExternalLink, X } from 'lucide-react'

interface Message {
  id: string
  created_at: string
  role: 'user' | 'assistant'
  sender_type: 'customer' | 'ai' | 'merchant'
  content: string | null
  attachment_url: string | null
}

interface Thread {
  order: { id: string; status: string; total_amount: number; customer_name: string | null; created_at: string }
  lastMessage: { content: string | null; attachment_url: string | null; role: string; created_at: string }
}

const STATUS_LABEL: Record<string, string> = {
  pending_payment: 'Menunggu Bayar',
  payment_submitted: 'Bukti Dikirim',
  payment_verified: 'Pembayaran OK',
  shipped: 'Dikirim',
  delivered: 'Terkirim',
  cancelled: 'Dibatalkan',
}
const STATUS_COLOR: Record<string, string> = {
  pending_payment: 'text-yellow-700 bg-yellow-50',
  payment_submitted: 'text-blue-700 bg-blue-50',
  payment_verified: 'text-green-700 bg-green-50',
  shipped: 'text-purple-700 bg-purple-50',
  delivered: 'text-emerald-700 bg-emerald-50',
  cancelled: 'text-red-500 bg-red-50',
}

function fmt(n: number) { return 'Rp ' + n.toLocaleString('id-ID') }
function timeAgo(s: string) {
  const d = new Date(s)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

interface Props { slug: string; threads: Thread[] }

function ImageZoom({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center" onClick={onClose}>
      <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={onClose}><X size={24} /></button>
      <div onClick={e => e.stopPropagation()}>
        <Image src={src} alt="Preview" width={600} height={600} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg" />
      </div>
    </div>
  )
}

export function ChatsClient({ slug, threads }: Props) {
  const [zoomSrc, setZoomSrc] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const [selected, setSelected] = useState<string | null>(() => {
    const fromUrl = searchParams.get('order')
    const exists = threads.some(t => t.order.id === fromUrl)
    return (fromUrl && exists) ? fromUrl : (threads[0]?.order.id ?? null)
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const fromUrl = searchParams.get('order')
    if (fromUrl && threads.some(t => t.order.id === fromUrl)) setSelected(fromUrl)
  }, [searchParams, threads])

  // Load full messages on-demand when thread selected
  useEffect(() => {
    if (!selected) return
    setLoadingMsgs(true)
    setMessages([])
    fetch(`/api/merchant-chat?orderId=${selected}&slug=${slug}`)
      .then(r => r.json())
      .then(data => setMessages(data.messages ?? []))
      .finally(() => setLoadingMsgs(false))
  }, [selected, slug])

  async function sendReply() {
    if (!replyText.trim() || !selected || sending) return
    setSending(true)
    const content = replyText.trim()
    setReplyText('')
    const res = await fetch('/api/merchant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, orderId: selected, content }),
    })
    if (res.ok) {
      const { message } = await res.json()
      setMessages(prev => [...prev, message])
    }
    setSending(false)
  }

  const activeThread = threads.find(t => t.order.id === selected)

  if (threads.length === 0) {
    return (
      <div>
        <h1 className="text-display italic mb-10">Chat Pesanan</h1>
        <div className="bg-white border border-black/8 rounded p-16 text-center">
          <MessageSquare size={40} className="mx-auto text-[var(--color-accent)]/20 mb-4" />
          <p className="text-headline-md italic text-[var(--color-accent)]/40">Belum ada percakapan.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {zoomSrc && <ImageZoom src={zoomSrc} onClose={() => setZoomSrc(null)} />}
      <h1 className="text-display italic mb-8">Chat Pesanan</h1>

      <div className="flex gap-0 bg-white border border-black/8 rounded overflow-hidden" style={{ height: 'calc(100vh - 240px)', minHeight: '500px' }}>

        {/* Thread list — only lastMessage needed for preview */}
        <div className="w-72 shrink-0 border-r border-black/8 overflow-y-auto">
          {threads.map(t => {
            const isActive = selected === t.order.id
            const preview = t.lastMessage?.content?.slice(0, 60) ?? (t.lastMessage?.attachment_url ? '📎 Foto' : '')
            return (
              <button key={t.order.id} onClick={() => setSelected(t.order.id)}
                className={`w-full text-left px-5 py-4 border-b border-black/5 transition-colors ${isActive ? 'bg-[var(--color-primary)]/5 border-l-2 border-l-[var(--color-primary)]' : 'hover:bg-black/[0.02]'}`}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-body-md font-medium truncate">{t.order.customer_name ?? 'Pelanggan'}</p>
                  <span className={`text-[9px] font-sans px-1.5 py-0.5 rounded shrink-0 ${STATUS_COLOR[t.order.status] ?? 'text-black/50 bg-black/5'}`}>
                    {STATUS_LABEL[t.order.status] ?? t.order.status}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--color-accent)]/50 font-sans truncate">{preview}</p>
                <p className="text-[10px] text-[var(--color-accent)]/30 font-sans mt-1">{timeAgo(t.order.created_at)}</p>
              </button>
            )
          })}
        </div>

        {/* Chat view — full messages loaded on-demand */}
        {activeThread ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-6 py-4 border-b border-black/8 flex items-center justify-between shrink-0">
              <div>
                <p className="text-body-md font-medium">{activeThread.order.customer_name ?? 'Pelanggan'}</p>
                <p className="text-[11px] text-[var(--color-accent)]/40 font-sans">
                  #{activeThread.order.id.slice(-8).toUpperCase()} · {fmt(activeThread.order.total_amount)}
                </p>
              </div>
              <Link href={`/${slug}/orders?order=${selected}`}
                className="flex items-center gap-1.5 text-label-caps text-[10px] border border-black/15 px-3 py-2 hover:bg-[var(--color-secondary)] transition-colors">
                <ExternalLink size={11} />PESANAN
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-[12px] text-[var(--color-accent)]/30 font-sans">Memuat pesan...</p>
                </div>
              ) : messages.map(msg => {
                const isCustomer = msg.role === 'user'
                const isMerchant = msg.sender_type === 'merchant'
                const isAI = msg.sender_type === 'ai' || (!isCustomer && !isMerchant)

                return (
                  <div key={msg.id} className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isCustomer
                        ? 'bg-[var(--color-primary)] text-white rounded-tr-sm'
                        : isMerchant
                          ? 'bg-black text-white rounded-tl-sm'
                          : 'bg-[var(--color-secondary)] text-[var(--color-accent)] rounded-tl-sm'
                    }`}>
                      {/* Label pengirim untuk pesan masuk */}
                      {!isCustomer && (
                        <p className={`text-[9px] tracking-widest uppercase font-sans mb-1.5 ${
                          isMerchant ? 'text-white/50' : 'text-[var(--color-accent)]/40'
                        }`}>
                          {isMerchant ? 'Kamu (Merchant)' : 'AI Assistant'}
                        </p>
                      )}
                      {msg.attachment_url && (
                        <button className="mb-2 block cursor-zoom-in hover:opacity-90 transition-opacity"
                          onClick={() => setZoomSrc(msg.attachment_url!)}>
                          <Image src={msg.attachment_url} alt="attachment" width={200} height={160}
                            className="rounded-lg object-cover max-h-[160px] w-auto" />
                        </button>
                      )}
                      {msg.content && (
                        <p className="text-[13px] leading-relaxed whitespace-pre-line">{msg.content}</p>
                      )}
                      <p className={`text-[10px] mt-1 ${isCustomer || isMerchant ? 'text-white/40' : 'text-[var(--color-accent)]/30'}`}>
                        {timeAgo(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Merchant reply input */}
            <div className="px-6 py-4 border-t border-black/8 bg-white shrink-0">
              <div className="flex gap-3 items-end">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                  placeholder="Balas sebagai merchant... (Enter untuk kirim)"
                  rows={2}
                  disabled={sending}
                  className="flex-1 bg-[var(--color-secondary)] border border-black/15 rounded-xl px-4 py-2.5 text-[13px] resize-none focus:outline-none focus:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                />
                <button
                  onClick={sendReply}
                  disabled={!replyText.trim() || sending}
                  className="px-4 py-2.5 bg-black text-white text-label-caps text-[10px] tracking-widest rounded-xl hover:opacity-80 transition-opacity disabled:opacity-40"
                >
                  Kirim
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-accent)]/30">
            <p className="text-body-md italic">Pilih percakapan</p>
          </div>
        )}
      </div>
    </div>
  )
}
