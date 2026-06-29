'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

const PRIMARY = '#0A2F73'
const GOLD = '#F4B400'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Apa itu UMKMu?',
  'Berapa biaya berlangganan?',
  'Bagaimana cara mulai?',
  'Fitur apa saja yang tersedia?',
]

export function LandingChat() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Halo! Saya customer care UMKMu 👋 Ada yang bisa saya bantu? Tanya apa saja tentang platform kami.',
      }])
    }
  }, [open, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: msg }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/landing/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.text ?? 'Maaf, terjadi kesalahan.' }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Gagal terhubung. Coba lagi.' }])
    } finally {
      setLoading(false)
    }
  }

  const showSuggestions = messages.length <= 1 && !loading

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full shadow-lg px-5 py-3.5 transition-all hover:scale-105 active:scale-95"
        style={{ background: PRIMARY }}
      >
        {open
          ? <X size={18} className="text-white" />
          : <MessageCircle size={18} className="text-white" />}
        {!open && <span className="text-white text-sm font-semibold">Tanya UMKMu</span>}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[520px] rounded-2xl shadow-2xl flex flex-col bg-white border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: PRIMARY }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: GOLD, color: '#1a1a1a' }}>
              U
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Customer Care UMKMu</p>
              <p className="text-white/50 text-xs">Biasanya membalas dalam hitungan detik</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                  style={m.role === 'user'
                    ? { background: PRIMARY, color: '#fff' }
                    : { background: '#F8FAFC', color: '#111827', border: '1px solid #E5EAF0' }}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3" style={{ background: '#F8FAFC', border: '1px solid #E5EAF0' }}>
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#E5EAF0', color: PRIMARY }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <input
              className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0A2F73] transition-colors"
              placeholder="Tulis pertanyaan..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              disabled={loading}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40"
              style={{ background: PRIMARY }}
            >
              <Send size={14} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
