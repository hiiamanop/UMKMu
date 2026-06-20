'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Product } from '@/lib/supabase/types'
import { upsertProduct } from '../actions'

const SKIN_TYPES = [
  { value: 'oily', label: 'Berminyak' },
  { value: 'combination', label: 'Kombinasi' },
  { value: 'dry', label: 'Kering' },
  { value: 'sensitive', label: 'Sensitif' },
  { value: 'all', label: 'Semua Jenis' },
]

const CONCERNS = [
  { value: 'acne', label: 'Anti Jerawat' },
  { value: 'brightening', label: 'Mencerahkan' },
  { value: 'anti-aging', label: 'Anti Aging' },
  { value: 'hydrating', label: 'Melembapkan' },
  { value: 'pores', label: 'Mengecilkan Pori' },
  { value: 'soothing', label: 'Menenangkan' },
  { value: 'firming', label: 'Mengencangkan' },
]

const USAGE_STEPS = [
  'cleanser', 'toner', 'serum', 'moisturizer', 'sunscreen', 'treatment', 'mask'
]

interface Props {
  slug: string
  product?: Product
  onSuccess?: () => void
}

export function ProductForm({ slug, product, onSuccess }: Props) {
  const action = upsertProduct.bind(null, slug, product?.id ?? null)
  const [state, formAction, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      const result = await action(formData)
      if (result.success && onSuccess) onSuccess()
      return result
    },
    null
  )

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nama Produk *</label>
        <Input name="name" defaultValue={product?.name} required />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Deskripsi</label>
        <Textarea name="description" defaultValue={product?.description ?? ''} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Harga (Rp)</label>
        <Input name="price" type="number" defaultValue={product?.price ?? ''} placeholder="150000" />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Foto Produk</label>
        <input name="image" type="file" accept="image/jpeg,image/png,image/webp"
          className="text-sm text-gray-600" />
        {product?.image_url && (
          <p className="text-xs text-gray-400">Foto saat ini sudah ada. Upload baru untuk mengganti.</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Step Penggunaan</label>
        <select name="usage_step" defaultValue={product?.usage_step ?? ''}
          className="w-full border rounded-md px-3 py-2 text-sm">
          <option value="">-- Pilih --</option>
          {USAGE_STEPS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Cocok untuk Jenis Kulit</label>
        <div className="flex flex-wrap gap-2">
          {SKIN_TYPES.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="skin_types" value={value}
                defaultChecked={product?.skin_types.includes(value)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Manfaat / Concern</label>
        <div className="flex flex-wrap gap-2">
          {CONCERNS.map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="concerns" value={value}
                defaultChecked={product?.concerns.includes(value)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Bahan Utama (pisahkan dengan koma)</label>
        <Input name="ingredients" defaultValue={product?.ingredients.join(', ') ?? ''}
          placeholder="niacinamide, vitamin-c, ceramide" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Link Tokopedia</label>
          <Input name="tokopedia_url" defaultValue={product?.tokopedia_url ?? ''} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Link Shopee</label>
          <Input name="shopee_url" defaultValue={product?.shopee_url ?? ''} />
        </div>
      </div>

      {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
      {state?.success && <p className="text-green-600 text-sm">Produk disimpan!</p>}

      <Button type="submit" disabled={pending}>
        {pending ? 'Menyimpan...' : product ? 'Update Produk' : 'Tambah Produk'}
      </Button>
    </form>
  )
}
