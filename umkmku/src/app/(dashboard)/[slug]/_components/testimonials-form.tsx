'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Testimonial } from '@/lib/supabase/types'
import { saveTestimonial, deleteTestimonial } from '../actions'

interface Props {
  slug: string
  testimonials: Testimonial[]
}

function TestimonialRow({ slug, item }: { slug: string; item: Testimonial }) {
  const [open, setOpen] = useState(false)
  const [img1Preview, setImg1Preview] = useState<string | null>(null)
  const [img2Preview, setImg2Preview] = useState<string | null>(null)
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => saveTestimonial(slug, formData),
    null
  )

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <div>
          <span className="font-medium text-sm">{item.author_name}</span>
          {item.author_title && <span className="text-gray-400 text-xs ml-2">— {item.author_title}</span>}
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <form action={action} encType="multipart/form-data" className="p-4 space-y-4">
          <input type="hidden" name="id" value={item.id} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Nama</label>
              <Input name="author_name" defaultValue={item.author_name} required />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Jabatan / Keterangan</label>
              <Input name="author_title" defaultValue={item.author_title ?? ''} placeholder="Pelanggan setia" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Kutipan</label>
            <Textarea name="quote" defaultValue={item.quote} rows={3} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { field: 'image_1', label: 'Foto 1', current: item.image_1_url, preview: img1Preview, setPreview: setImg1Preview },
              { field: 'image_2', label: 'Foto 2', current: item.image_2_url, preview: img2Preview, setPreview: setImg2Preview },
            ].map(({ field, label, current, preview, setPreview }) => (
              <div key={field} className="space-y-2">
                <label className="text-xs font-medium text-gray-600">{label}</label>
                <div className="relative w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                  {(preview ?? current) && (
                    <Image src={preview ?? current!} alt={label} fill className="object-cover" />
                  )}
                </div>
                <input
                  type="file"
                  name={field}
                  accept="image/jpeg,image/png,image/webp"
                  className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }}
                />
              </div>
            ))}
          </div>

          {state?.error && <p className="text-red-600 text-xs">{state.error}</p>}
          {state?.success && <p className="text-green-600 text-xs">Tersimpan!</p>}

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={pending}>
              {pending ? 'Menyimpan...' : 'Simpan'}
            </Button>
            <DeleteButton slug={slug} id={item.id} />
          </div>
        </form>
      )}
    </div>
  )
}

function DeleteButton({ slug, id }: { slug: string; id: string }) {
  const [, action, pending] = useActionState(
    async () => deleteTestimonial(slug, id),
    null
  )
  return (
    <form action={action}>
      <Button type="submit" variant="destructive" size="sm" disabled={pending}>
        <Trash2 size={14} className="mr-1" />
        Hapus
      </Button>
    </form>
  )
}

function AddTestimonialForm({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false)
  const [img1Preview, setImg1Preview] = useState<string | null>(null)
  const [img2Preview, setImg2Preview] = useState<string | null>(null)
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await saveTestimonial(slug, formData)
      if (result.success) setOpen(false)
      return result
    },
    null
  )

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus size={14} className="mr-1" /> Tambah Testimonial
      </Button>
    )
  }

  return (
    <form action={action} encType="multipart/form-data" className="border rounded-lg p-4 space-y-4 bg-blue-50/30">
      <h4 className="text-sm font-medium">Testimonial Baru</h4>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Nama</label>
          <Input name="author_name" required placeholder="Nama pelanggan" />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Jabatan / Keterangan</label>
          <Input name="author_title" placeholder="Pelanggan setia" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Kutipan</label>
        <Textarea name="quote" rows={3} required placeholder="Pengalaman mereka menggunakan produk..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { field: 'image_1', label: 'Foto 1', preview: img1Preview, setPreview: setImg1Preview },
          { field: 'image_2', label: 'Foto 2', preview: img2Preview, setPreview: setImg2Preview },
        ].map(({ field, label, preview, setPreview }) => (
          <div key={field} className="space-y-2">
            <label className="text-xs font-medium text-gray-600">{label}</label>
            {preview && (
              <div className="relative w-full aspect-[3/4] bg-gray-100 rounded overflow-hidden">
                <Image src={preview} alt={label} fill className="object-cover" />
              </div>
            )}
            <input
              type="file"
              name={field}
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-gray-100 file:text-gray-700"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)) }}
            />
          </div>
        ))}
      </div>

      {state?.error && <p className="text-red-600 text-xs">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Tambah'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>Batal</Button>
      </div>
    </form>
  )
}

export function TestimonialsForm({ slug, testimonials }: Props) {
  return (
    <div className="bg-white rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Testimonial</h2>
        <span className="text-xs text-gray-400">{testimonials.length} testimoni</span>
      </div>
      <p className="text-sm text-gray-500">
        Setiap testimonial ditampilkan di bagian bawah toko dengan 2 foto pelanggan.
      </p>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <TestimonialRow key={t.id} slug={slug} item={t} />
        ))}
        {testimonials.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Belum ada testimonial.</p>
        )}
      </div>

      <AddTestimonialForm slug={slug} />
    </div>
  )
}
