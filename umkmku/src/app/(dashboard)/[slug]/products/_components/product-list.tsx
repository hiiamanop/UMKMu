'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/lib/supabase/types'
import { ProductForm } from './product-form'
import { deleteProduct } from '../actions'

interface Props {
  slug: string
  products: Product[]
}

export function ProductList({ slug, products: initialProducts }: Props) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Produk ({initialProducts.length})</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm">
          + Tambah Produk
        </Button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-medium mb-4">Produk Baru</h3>
          <ProductForm
            slug={slug}
            onSuccess={() => setShowAddForm(false)}
          />
        </div>
      )}

      {initialProducts.map((product) => (
        <div key={product.id} className="bg-white rounded-xl p-4 border space-y-3">
          {editingId === product.id ? (
            <ProductForm
              slug={slug}
              product={product}
              onSuccess={() => setEditingId(null)}
            />
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {product.price ? `Rp ${product.price.toLocaleString('id-ID')}` : 'Harga belum diset'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingId(product.id)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={async () => {
                    if (confirm(`Hapus ${product.name}?`)) {
                      await deleteProduct(slug, product.id)
                    }
                  }}
                >
                  Hapus
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
