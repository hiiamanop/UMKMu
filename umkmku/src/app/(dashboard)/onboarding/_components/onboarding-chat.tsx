'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { CategoryType } from '@/lib/categories'

type Status = 'idle' | 'loading' | 'success' | 'error'
type Step = 'category' | 'description' | 'signup'

interface OnboardingResult {
  slug: string
  brand_name: string
  store_url: string
}

const CATEGORIES: { value: CategoryType; label: string; description: string; icon: string }[] = [
  { value: 'skincare', label: 'Skincare', description: 'Perawatan kulit', icon: '✨' },
  { value: 'parfum', label: 'Parfum', description: 'Wewangian', icon: '🌸' },
  { value: 'fashion', label: 'Fashion', description: 'Pakaian & aksesoris', icon: '👗' },
  { value: 'fdb', label: 'F&B', description: 'Makanan & minuman', icon: '🍃' },
]

export function OnboardingChat() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Signup form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [emailConfirmNeeded, setEmailConfirmNeeded] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || status === 'loading' || !category) return

    setStatus('loading')
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, description }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? 'Terjadi kesalahan')
      }

      const data: OnboardingResult = await response.json()
      setResult(data)
      setStatus('success')
      setStep('signup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setStatus('error')
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (!result) return
    if (password !== confirmPassword) {
      setSignupError('Password tidak cocok.')
      return
    }
    if (password.length < 6) {
      setSignupError('Password minimal 6 karakter.')
      return
    }

    setSignupLoading(true)
    setSignupError(null)

    const supabase = createClient()

    const { data: authData, error: signupErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })

    if (signupErr) {
      setSignupError(signupErr.message)
      setSignupLoading(false)
      return
    }

    // Link tenant ke user via API (session cookie otomatis tersedia)
    const userId = authData.user?.id
    if (userId) {
      await fetch('/api/onboarding/link-merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: result.slug, userId }),
      })
    }

    // Jika session langsung tersedia (email confirm disabled), redirect ke dashboard
    if (authData.session) {
      router.push(`/${result.slug}`)
      return
    }

    // Jika perlu konfirmasi email
    setEmailConfirmNeeded(true)
    setSignupLoading(false)
  }

  const inputCls = 'w-full bg-white border border-black/15 px-4 py-3 text-sm focus:outline-none focus:border-black/40 transition-colors'
  const labelCls = 'block text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5'

  // Step: signup
  if (step === 'signup' && result) {
    if (emailConfirmNeeded) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center space-y-3">
          <CheckCircle2 className="mx-auto text-blue-500" size={40} />
          <h2 className="font-semibold text-blue-800 text-lg">Cek email kamu!</h2>
          <p className="text-blue-700 text-sm">
            Kami kirim link konfirmasi ke <strong>{email}</strong>.<br />
            Klik link tersebut lalu login ke dashboard tokomu.
          </p>
          <a
            href={`/${result.slug}/login`}
            className="inline-block mt-4 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Ke halaman login
          </a>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Success banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg px-5 py-4 flex items-start gap-3">
          <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="text-sm font-semibold text-green-800">Toko <em>{result.brand_name}</em> berhasil dibuat!</p>
            <p className="text-sm text-green-700 mt-0.5">
              Sekarang buat akun untuk mengakses dashboard tokomu.
            </p>
          </div>
        </div>

        {/* Signup form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className={labelCls}>Nama Lengkap</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Nama kamu"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@bisnis.com"
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className={labelCls}>Konfirmasi Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              required
              className={inputCls}
            />
          </div>

          {signupError && (
            <p className="text-red-600 text-sm">{signupError}</p>
          )}

          <button
            type="submit"
            disabled={signupLoading || !email || !password}
            className="w-full py-3 bg-black text-white text-sm font-medium tracking-widest uppercase disabled:opacity-50 hover:bg-black/80 transition-colors"
          >
            {signupLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={16} /> Membuat akun...
              </span>
            ) : (
              'Buat Akun & Masuk Dashboard'
            )}
          </button>
        </form>
      </div>
    )
  }

  // Step: category
  if (step === 'category') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            Pilih kategori bisnis kamu agar AI bisa extract produk dengan field yang tepat.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => {
                setCategory(cat.value)
                setStep('description')
              }}
              className="p-4 border-2 border-gray-200 rounded-lg text-left transition-all hover:border-gray-400"
            >
              <span className="text-2xl block mb-2">{cat.icon}</span>
              <h3 className="font-semibold text-gray-900">{cat.label}</h3>
              <p className="text-sm text-gray-600">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Step: description
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Kategori: <span className="font-semibold">{CATEGORIES.find(c => c.value === category)?.label}</span>
        </p>
        <button
          type="button"
          onClick={() => setStep('category')}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          Ubah
        </button>
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Contoh: Saya jualan skincare lokal nama Glow.id, brand saya identik dengan warna hijau sage dan krem. Produk saya ada 3: Vitamin C Serum untuk mencerahkan kulit, Barrier Moisturizer untuk semua jenis kulit, dan Daily Sunscreen SPF 50. WA saya 08123456789."
        className="min-h-[180px] resize-none"
        disabled={status === 'loading'}
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={!description.trim() || status === 'loading'}
        className="w-full py-3 bg-black text-white text-sm font-medium tracking-widest uppercase disabled:opacity-50 hover:bg-black/80 transition-colors"
      >
        {status === 'loading' ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={16} /> AI sedang memproses...
          </span>
        ) : (
          'Buat Toko Saya'
        )}
      </button>
    </form>
  )
}
