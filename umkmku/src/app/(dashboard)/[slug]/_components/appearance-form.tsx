'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Tenant } from '@/lib/supabase/types'
import { updateAppearance } from '../actions'

interface Props {
  tenant: Tenant
}

export function AppearanceForm({ tenant }: Props) {
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return updateAppearance(tenant.slug, formData)
    },
    null
  )

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h2 className="font-semibold text-lg">Tampilan & Warna</h2>

      <form action={action} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Warna Utama</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                name="primary_color"
                defaultValue={tenant.primary_color ?? '#1a1a1a'}
                className="h-10 w-12 rounded cursor-pointer border"
              />
              <Input
                name="primary_color_text"
                defaultValue={tenant.primary_color ?? '#1a1a1a'}
                placeholder="#1a1a1a"
                className="font-mono text-sm"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Warna Background</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                name="secondary_color"
                defaultValue={tenant.secondary_color ?? '#f5f5f5'}
                className="h-10 w-12 rounded cursor-pointer border"
              />
              <Input
                name="secondary_color_text"
                defaultValue={tenant.secondary_color ?? '#f5f5f5'}
                placeholder="#f5f5f5"
                className="font-mono text-sm"
                readOnly
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Warna Aksen</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                name="accent_color"
                defaultValue={tenant.accent_color ?? '#d4a574'}
                className="h-10 w-12 rounded cursor-pointer border"
              />
              <Input
                name="accent_color_text"
                defaultValue={tenant.accent_color ?? '#d4a574'}
                placeholder="#d4a574"
                className="font-mono text-sm"
                readOnly
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-sm"
          style={{
            backgroundColor: tenant.secondary_color ?? '#f5f5f5',
            color: tenant.primary_color ?? '#1a1a1a',
            borderLeft: `4px solid ${tenant.accent_color ?? '#d4a574'}`,
          }}
        >
          Preview: Begini tampilan warna di toko kamu
        </div>

        {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-sm">Warna disimpan!</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Warna'}
        </Button>
      </form>
    </div>
  )
}
