'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'
import type { CategoryType } from '@/lib/categories'

type Status = 'idle' | 'loading' | 'success' | 'error'
type Step = 'category' | 'description'

interface OnboardingResult {
  slug: string
  brand_name: string
  store_url: string
}

const CATEGORIES: { value: CategoryType; label: string; description: string }[] = [
  { value: 'skincare', label: 'Skincare', description: 'Perawatan kulit' },
  { value: 'parfum', label: 'Parfum', description: 'Wewangian' },
  { value: 'fashion', label: 'Fashion', description: 'Pakaian & aksesoris' },
  { value: 'fdb', label: 'F&B', description: 'Makanan & minuman' },
]

export function OnboardingChat() {
  const [step, setStep] = useState<Step>('category')
  const [category, setCategory] = useState<CategoryType | null>(null)
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
      setStatus('error')
    }
  }

  if (status === 'success' && result) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 space-y-3">
        <h2 className="font-semibold text-green-800">
          Toko {result.brand_name} sudah aktif!
        </h2>
        <p className="text-green-700">
          Toko kamu bisa diakses di:{' '}
          <a
            href={result.store_url}
            target="_blank"
            className="font-mono underline"
          >
            {result.store_url}
          </a>
        </p>
        <Button
          onClick={() => window.open(`/${result.slug}`, '_self')}
        >
          Buka Dashboard Toko
        </Button>
      </div>
    )
  }

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
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                category === cat.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">{cat.label}</h3>
              <p className="text-sm text-gray-600">{cat.description}</p>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            Kategori: <span className="font-semibold">{CATEGORIES.find(c => c.value === category)?.label}</span>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setStep('category')}
        >
          Ubah
        </Button>
      </div>
      <Textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder={`Contoh: Saya jualan skincare lokal nama Glow.id, brand saya identik dengan warna hijau sage dan krem. Produk saya ada 3: Vitamin C Serum untuk mencerahkan kulit, Barrier Moisturizer untuk semua jenis kulit, dan Daily Sunscreen SPF 50. Target customer saya wanita 20-35 tahun yang peduli kulit. WA saya 08123456789.`}
        className="min-h-[180px] resize-none"
        disabled={status === 'loading'}
      />
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
      <Button
        type="submit"
        disabled={!description.trim() || status === 'loading'}
        className="w-full"
      >
        {status === 'loading' ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            AI sedang memproses...
          </>
        ) : (
          'Buat Toko Saya'
        )}
      </Button>
    </form>
  )
}
