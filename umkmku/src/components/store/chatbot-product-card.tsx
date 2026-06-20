import type { Product } from '@/lib/supabase/types'

interface Props {
  product: Product
}

export function ChatbotProductCard({ product }: Props) {
  const hasLink = product.tokopedia_url || product.shopee_url

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 mt-2 space-y-2">
      <div>
        <p className="font-medium text-sm">{product.name}</p>
        {product.price && (
          <p className="text-xs text-gray-500">
            Rp {product.price.toLocaleString('id-ID')}
          </p>
        )}
      </div>

      {hasLink && (
        <div className="flex gap-2">
          {product.tokopedia_url && (
            <a
              href={product.tokopedia_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
            >
              Lihat di Tokopedia
            </a>
          )}
          {product.shopee_url && (
            <a
              href={product.shopee_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
            >
              Lihat di Shopee
            </a>
          )}
        </div>
      )}
    </div>
  )
}
