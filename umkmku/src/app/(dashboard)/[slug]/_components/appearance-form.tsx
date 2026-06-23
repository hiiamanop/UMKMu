'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Tenant } from '@/lib/supabase/types'
import { updateAppearance } from '../actions'

interface Props {
  tenant: Tenant
}

function ImageUploader({
  name,
  label,
  hint,
  currentUrl,
  aspectClass = 'w-40 h-24',
}: {
  name: string
  label: string
  hint: string
  currentUrl: string | null | undefined
  aspectClass?: string
}) {
  const [preview, setPreview] = useState<string | null>(null)
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex gap-4 items-start">
        <div className={`${aspectClass} rounded-lg overflow-hidden bg-gray-100 border shrink-0 relative`}>
          {(preview ?? currentUrl) ? (
            <Image src={preview ?? currentUrl!} alt={label} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center px-2">
              Belum ada gambar
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <input
            type="file"
            name={name}
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setPreview(URL.createObjectURL(file))
            }}
          />
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
      </div>
    </div>
  )
}

export function AppearanceForm({ tenant }: Props) {
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => updateAppearance(tenant.slug, formData),
    null
  )

  return (
    <div className="bg-white rounded-xl p-6 space-y-8">
      <h2 className="font-semibold text-lg">Tampilan & Warna</h2>

      <form action={action} encType="multipart/form-data" className="space-y-8">

        {/* Colors */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Warna</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { name: 'primary_color', label: 'Warna Utama', default: tenant.primary_color ?? '#1a1a1a' },
              { name: 'secondary_color', label: 'Warna Background', default: tenant.secondary_color ?? '#f5f5f5' },
              { name: 'accent_color', label: 'Warna Aksen', default: tenant.accent_color ?? '#d4a574' },
            ].map((c) => (
              <div key={c.name} className="space-y-1">
                <label className="text-sm font-medium">{c.label}</label>
                <div className="flex gap-2 items-center">
                  <input type="color" name={c.name} defaultValue={c.default}
                    className="h-10 w-12 rounded cursor-pointer border" />
                  <Input name={`${c.name}_text`} defaultValue={c.default}
                    placeholder={c.default} className="font-mono text-sm" readOnly />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-4 text-sm" style={{
            backgroundColor: tenant.secondary_color ?? '#f5f5f5',
            color: tenant.primary_color ?? '#1a1a1a',
            borderLeft: `4px solid ${tenant.accent_color ?? '#d4a574'}`,
          }}>
            Preview: Begini tampilan warna di toko kamu
          </div>
        </div>

        {/* Images */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Gambar</h3>

          <ImageUploader
            name="hero_image"
            label="Hero — background kiri halaman utama"
            hint="JPG, PNG, WebP — maks 5MB. Rekomendasi: 1920×1080px"
            currentUrl={tenant.hero_image_url}
            aspectClass="w-40 h-24"
          />

          <div className="grid grid-cols-2 gap-6">
            <ImageUploader
              name="about_image_1"
              label="About — foto kiri"
              hint="Rekomendasi: 3:4 portrait"
              currentUrl={tenant.about_image_1_url}
              aspectClass="w-24 h-32"
            />
            <ImageUploader
              name="about_image_2"
              label="About — foto kanan (lebih rendah)"
              hint="Rekomendasi: 3:4 portrait"
              currentUrl={tenant.about_image_2_url}
              aspectClass="w-24 h-32"
            />
          </div>

          <ImageUploader
            name="cta_image"
            label="CTA Banner — background 'Temukan Koleksi Kami'"
            hint="JPG, PNG, WebP — maks 5MB. Rekomendasi: 1920×500px landscape"
            currentUrl={tenant.cta_image_url}
            aspectClass="w-40 h-20"
          />

          <ImageUploader
            name="footer_image"
            label="Footer — foto tengah footer"
            hint="JPG, PNG, WebP — maks 5MB"
            currentUrl={tenant.footer_image_url}
            aspectClass="w-40 h-24"
          />
        </div>

        {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-sm">Perubahan disimpan!</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Tampilan'}
        </Button>
      </form>
    </div>
  )
}
