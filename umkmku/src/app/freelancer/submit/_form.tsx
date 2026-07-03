'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Upload, X, CheckCircle2, Monitor, Smartphone, Eye, Trash2 } from 'lucide-react'

const PRIMARY = '#0A2F73'
const BORDER = '#E5EAF0'

const CATEGORIES = [
  { value: 'skincare', label: 'Skincare & Beauty' },
  { value: 'parfum', label: 'Parfum' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'fdb', label: 'Makanan & Minuman' },
]

const inputCls = 'w-full rounded-xl px-4 py-3 text-sm border outline-none transition-colors bg-white'
const inputStyle = { borderColor: BORDER }

type PreviewFile = { url: string; name: string; type: 'desktop' | 'mobile' }

export function SubmitTemplateForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [demoUrl, setDemoUrl] = useState('')
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([])
  const [uploadMode, setUploadMode] = useState<'desktop' | 'mobile'>('desktop')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const form = new FormData()
        form.append('file', file)
        form.append('context', 'template-preview')
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        if (!res.ok) throw new Error('Upload gagal')
        const { url } = await res.json()
        setPreviewFiles(prev => [...prev, { url, name: file.name, type: uploadMode }])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload gagal')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !category || !repoUrl.trim() || !demoUrl.trim()) return
    setLoading(true)
    setError(null)
    try {
      // Desktop first (index 0), mobile second (index 1) — sesuai konvensi admin templates
      const ordered = [
        ...previewFiles.filter(f => f.type === 'desktop').map(f => f.url),
        ...previewFiles.filter(f => f.type === 'mobile').map(f => f.url),
      ]
      const res = await fetch('/api/freelancer/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          category,
          repo_url: repoUrl,
          demo_url: demoUrl,
          preview_image_urls: ordered,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Terjadi kesalahan')
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border bg-white p-10 text-center flex flex-col items-center gap-4" style={{ borderColor: BORDER }}>
        <CheckCircle2 size={40} className="text-green-500" />
        <h2 className="text-lg font-bold text-gray-900">Template berhasil disubmit!</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          Tim kami akan mereview dalam 1-3 hari kerja. Kamu akan mendapat notifikasi via email.
        </p>
        <button
          onClick={() => router.push('/freelancer/dashboard')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: PRIMARY }}
        >
          Ke Dashboard
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-white p-8 space-y-5" style={{ borderColor: BORDER }}>
      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: PRIMARY }}>Nama Template *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Skincare Minimal Dark" required className={inputCls} style={inputStyle} onFocus={e => (e.target.style.borderColor = PRIMARY)} onBlur={e => (e.target.style.borderColor = BORDER)} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: PRIMARY }}>Kategori *</label>
        <select value={category} onChange={e => setCategory(e.target.value)} required className={inputCls} style={inputStyle}>
          <option value="">Pilih kategori</option>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: PRIMARY }}>Deskripsi</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Jelaskan gaya/mood template, cocok untuk brand seperti apa..." className={inputCls} style={{ ...inputStyle, minHeight: '80px', resize: 'none' }} onFocus={e => (e.target.style.borderColor = PRIMARY)} onBlur={e => (e.target.style.borderColor = BORDER)} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: PRIMARY }}>GitHub / GitLab Repo URL * <span className="font-normal text-gray-400">(harus public)</span></label>
        <input type="url" value={repoUrl} onChange={e => setRepoUrl(e.target.value)} placeholder="https://github.com/username/template-repo" required className={inputCls} style={inputStyle} onFocus={e => (e.target.style.borderColor = PRIMARY)} onBlur={e => (e.target.style.borderColor = BORDER)} />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1.5" style={{ color: PRIMARY }}>URL Live Demo * <span className="font-normal text-gray-400">(wajib, untuk screenshot otomatis)</span></label>
        <input type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://demo-template.vercel.app" required className={inputCls} style={inputStyle} onFocus={e => (e.target.style.borderColor = PRIMARY)} onBlur={e => (e.target.style.borderColor = BORDER)} />
      </div>

      {/* Preview images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold" style={{ color: PRIMARY }}>
            Preview Images <span className="font-normal text-gray-400">(minimal 1 desktop + 1 mobile)</span>
          </label>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setUploadMode('desktop')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${uploadMode === 'desktop' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              <Monitor size={12} /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('mobile')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${uploadMode === 'mobile' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
            >
              <Smartphone size={12} /> Mobile
            </button>
          </div>
        </div>

        <div className="rounded-xl border space-y-0 overflow-hidden" style={{ borderColor: BORDER }}>
          {previewFiles.filter(f => f.type === uploadMode).length === 0 && (
            <div className="px-4 py-3 text-xs text-gray-400">
              Belum ada file {uploadMode}. Upload di bawah.
            </div>
          )}
          {previewFiles.filter(f => f.type === uploadMode).map((file, i) => (
            <div key={file.url} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: BORDER }}>
              <span className="flex-1 truncate text-gray-700 font-mono text-xs">{file.name}</span>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Eye size={13} /> Preview
              </a>
              <button
                type="button"
                onClick={() => setPreviewFiles(prev => prev.filter(f => f.url !== file.url))}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                <Trash2 size={13} /> Hapus
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          style={{ borderColor: BORDER }}
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {uploading ? 'Mengupload...' : `Tambah gambar ${uploadMode}`}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-400 mt-1.5">Desktop: 1440px · Mobile: 375px · Format JPG/PNG/WebP.</p>
      </div>

      {error && <div className="p-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">{error}</div>}

      <button
        type="submit"
        disabled={loading || !name.trim() || !category || !repoUrl.trim() || !demoUrl.trim()}
        className="w-full py-3.5 rounded-2xl font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50 text-white flex items-center justify-center gap-2"
        style={{ background: PRIMARY }}
      >
        {loading ? <><Loader2 size={16} className="animate-spin" /> Mengirim...</> : 'Submit untuk Review'}
      </button>
    </form>
  )
}
