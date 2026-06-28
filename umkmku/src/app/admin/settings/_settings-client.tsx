'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, Check, Loader2 } from 'lucide-react'

const PRIMARY = '#0A2F73'
const BORDER = '#E5EAF0'
const inputCls = 'w-full px-3 py-2.5 text-sm border border-[#E5EAF0] rounded-lg focus:outline-none focus:border-[#0A2F73]'

interface Props {
  qrisUrl: string
  qrisMerchantName: string
  supportPhone: string
  supportEmail: string
}

export function SettingsClient({ qrisUrl: initialQrisUrl, qrisMerchantName: initialName, supportPhone: initialPhone, supportEmail: initialEmail }: Props) {
  const [preview, setPreview] = useState(initialQrisUrl)
  const [uploading, setUploading] = useState(false)
  const [qrisSaved, setQrisSaved] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const [merchantName, setMerchantName] = useState(initialName)
  const [nameSaving, setNameSaving] = useState(false)
  const [nameSaved, setNameSaved] = useState(false)

  const [supportPhone, setSupportPhone] = useState(initialPhone)
  const [supportEmail, setSupportEmail] = useState(initialEmail)
  const [contactSaving, setContactSaving] = useState(false)
  const [contactSaved, setContactSaved] = useState(false)

  async function saveName() {
    setNameSaving(true)
    await fetch('/api/admin/settings/merchant-name', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: merchantName }),
    })
    setNameSaving(false)
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 3000)
  }

  async function saveContact() {
    setContactSaving(true)
    await fetch('/api/admin/settings/support-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: supportPhone, email: supportEmail }),
    })
    setContactSaving(false)
    setContactSaved(true)
    setTimeout(() => setContactSaved(false), 3000)
  }

  async function handleFile(file: File) {
    setUploading(true)
    setUploadError('')
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/admin/settings/upload-qris', { method: 'POST', body: form })
    const data = await res.json()
    if (!res.ok) { setUploadError(data.error ?? 'Upload gagal'); setUploading(false); return }
    setPreview(data.url)
    setQrisSaved(true)
    setUploading(false)
    setTimeout(() => setQrisSaved(false), 3000)
  }

  return (
    <div className="max-w-lg space-y-6">

      {/* Kontak Support */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-6">
        <h2 className="text-base font-semibold text-[#0A2F73] mb-1">Kontak Support</h2>
        <p className="text-xs text-[#5E6B85] mb-4">
          Ditampilkan ke merchant ketika bukti bayar gagal terverifikasi.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-[#5E6B85] block mb-1">Nomor WhatsApp</label>
            <input value={supportPhone} onChange={e => setSupportPhone(e.target.value)}
              placeholder="628xxxxxxxxxx" className={inputCls} />
            <p className="text-[11px] text-[#5E6B85] mt-1">Format internasional tanpa +, contoh: 6281234567890</p>
          </div>
          <div>
            <label className="text-xs font-medium text-[#5E6B85] block mb-1">Email Support</label>
            <input value={supportEmail} onChange={e => setSupportEmail(e.target.value)}
              placeholder="halo@umkmu.site" className={inputCls} />
          </div>
          <button onClick={saveContact} disabled={contactSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0A2F73] hover:opacity-90 disabled:opacity-50">
            {contactSaving ? <Loader2 size={14} className="animate-spin" /> : contactSaved ? <Check size={14} /> : null}
            {contactSaved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Nama Merchant QRIS */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-6">
        <h2 className="text-base font-semibold text-[#0A2F73] mb-1">Nama Merchant QRIS</h2>
        <p className="text-xs text-[#5E6B85] mb-4">
          Nama penerima di struk QRIS (misal: <strong>AHMAD NAUFAL</strong>). Digunakan AI untuk verifikasi nama penerima.
        </p>
        <div className="flex gap-2">
          <input value={merchantName} onChange={e => setMerchantName(e.target.value.toUpperCase())}
            placeholder="NAMA LENGKAP SESUAI QRIS"
            className={inputCls + ' flex-1 font-mono uppercase'} />
          <button onClick={saveName} disabled={nameSaving || !merchantName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0A2F73] hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
            {nameSaving ? <Loader2 size={14} className="animate-spin" /> : nameSaved ? <Check size={14} /> : null}
            {nameSaved ? 'Tersimpan' : 'Simpan'}
          </button>
        </div>
      </div>

      {/* Upload QRIS */}
      <div className="bg-white rounded-xl border border-[#E5EAF0] p-6">
        <h2 className="text-base font-semibold text-[#0A2F73] mb-1">Gambar QRIS</h2>
        <p className="text-xs text-[#5E6B85] mb-5">QRIS statis yang ditampilkan ke merchant saat berlangganan.</p>

        <input ref={inputRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {preview ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-[#E5EAF0]">
              <Image src={preview} alt="QRIS" fill className="object-contain" />
            </div>
            <button onClick={() => inputRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-[#E5EAF0] text-[#5E6B85] hover:bg-gray-50 disabled:opacity-50">
              {uploading ? <><Loader2 size={14} className="animate-spin" /> Mengupload...</> : <><Upload size={14} /> Ganti QRIS</>}
            </button>
          </div>
        ) : (
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="w-full py-12 rounded-xl flex flex-col items-center gap-3 border-2 border-dashed border-[#E5EAF0] hover:border-[#0A2F73] transition-colors">
            {uploading
              ? <><Loader2 size={24} className="animate-spin text-[#5E6B85]" /><span className="text-sm text-[#5E6B85]">Mengupload...</span></>
              : <><Upload size={24} className="text-[#5E6B85]" /><span className="text-sm text-[#5E6B85]">Upload foto QRIS</span></>}
          </button>
        )}

        {qrisSaved && <div className="mt-4 flex items-center gap-2 text-sm text-green-600"><Check size={14} /> QRIS berhasil disimpan</div>}
        {uploadError && <p className="mt-4 text-sm text-red-600">{uploadError}</p>}
      </div>
    </div>
  )
}
