'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface OnboardingResult {
  slug: string
  brand_name: string
  store_url: string
}

export function OnboardingChat() {
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!description.trim() || status === 'loading') return

    setStatus('loading')
    setError(null)

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
