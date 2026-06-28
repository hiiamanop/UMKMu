'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GenerateArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ title: string; summary: string } | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/admin/articles/generate', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setResult(data.article)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal generate artikel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-2">Generate Artikel</h1>
      <p className="text-sm text-gray-500 mb-8">
        AI akan mengambil berita UMKM terbaru dari Google News, lalu menyusun artikel baru.
        Notifikasi + prompt gambar akan dikirim ke Telegram kamu.
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-600">
            <strong>Sumber:</strong> Google News RSS — UMKM Indonesia
          </div>
          <div className="text-sm text-gray-600">
            <strong>AI:</strong> {process.env.NEXT_PUBLIC_AI_PROVIDER ?? 'Ollama/Gemini'}
          </div>
          <div className="text-sm text-gray-600">
            <strong>Output:</strong> Artikel draft + notifikasi Telegram + prompt gambar ChatGPT
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#0A2F73] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating... (30-60 detik)
              </>
            ) : '🚀 Generate Artikel Sekarang'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 rounded-lg bg-green-50 border border-green-200">
            <div className="text-sm font-semibold text-green-800 mb-1">✅ Artikel berhasil dibuat!</div>
            <div className="text-sm font-medium text-gray-800">{result.title}</div>
            <div className="text-xs text-gray-500 mt-1">Notifikasi sudah dikirim ke Telegram kamu.</div>
            <button
              onClick={() => router.push('/admin/articles')}
              className="mt-3 text-sm font-medium text-[#0A2F73] underline"
            >
              Lihat di daftar artikel →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
