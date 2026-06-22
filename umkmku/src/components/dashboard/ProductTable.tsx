'use client'

import { useState } from 'react'
import { Trash2, Edit2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/supabase/types'

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
  isLoading?: boolean
}

const categoryLabels: Record<string, string> = {
  skincare: 'Skincare',
  parfum: 'Parfum',
  fashion: 'Fashion',
  fdb: 'Food & Beverage',
}

const categoryColors: Record<string, string> = {
  skincare: 'bg-pink-100 text-pink-800',
  parfum: 'bg-purple-100 text-purple-800',
  fashion: 'bg-blue-100 text-blue-800',
  fdb: 'bg-green-100 text-green-800',
}

function formatRupiah(amount: number | null): string {
  if (amount === null) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  isLoading = false,
}: ProductTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (productId: string) => {
    if (deletingId) return // Already deleting

    setDeletingId(productId)
    try {
      await onDelete(productId)
    } finally {
      setDeletingId(null)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No products yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Start by adding your first product to your store.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {product.description}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    className={categoryColors[product.category_type] || 'bg-gray-100 text-gray-800'}
                  >
                    {categoryLabels[product.category_type]}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-gray-900">
                  {formatRupiah(product.price)}
                </td>
                <td className="px-6 py-4">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(product)}
                      disabled={isLoading}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(product.id)}
                      disabled={isLoading || deletingId === product.id}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Category</p>
                    <Badge
                      className={categoryColors[product.category_type] || 'bg-gray-100 text-gray-800'}
                      variant="secondary"
                    >
                      {categoryLabels[product.category_type]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Price</p>
                    <p className="font-semibold text-gray-900">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={product.is_active ? 'default' : 'secondary'}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(product)}
                    disabled={isLoading}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(product.id)}
                    disabled={isLoading || deletingId === product.id}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    {deletingId === product.id ? '...' : 'Delete'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
