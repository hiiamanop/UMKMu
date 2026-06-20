'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Tenant } from '@/lib/supabase/types'
import { updateBrand } from '../actions'

interface Props {
  tenant: Tenant
}

export function BrandForm({ tenant }: Props) {
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return updateBrand(tenant.slug, formData)
    },
    null
  )

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h2 className="font-semibold text-lg">Brand & Kontak</h2>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nama Brand *</label>
          <Input name="brand_name" defaultValue={tenant.brand_name} required />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tagline</label>
          <Input
            name="tagline"
            defaultValue={tenant.tagline ?? ''}
            placeholder="Tagline singkat brand kamu"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Deskripsi Brand</label>
          <Textarea
            name="description"
            defaultValue={tenant.description ?? ''}
            placeholder="Ceritakan brand kamu..."
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nomor WhatsApp</label>
            <Input
              name="whatsapp_number"
              defaultValue={tenant.whatsapp_number ?? ''}
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Instagram URL</label>
            <Input
              name="instagram_url"
              defaultValue={tenant.instagram_url ?? ''}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Tokopedia Store URL</label>
            <Input
              name="tokopedia_url"
              defaultValue={tenant.tokopedia_url ?? ''}
              placeholder="https://tokopedia.com/..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Shopee Store URL</label>
            <Input
              name="shopee_url"
              defaultValue={tenant.shopee_url ?? ''}
              placeholder="https://shopee.co.id/..."
            />
          </div>
        </div>

        {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-sm">Perubahan disimpan!</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </div>
  )
}
