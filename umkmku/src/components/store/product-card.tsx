import Image from 'next/image'
import type { Product } from '@/lib/supabase/types'

interface Props {
  product: Product
}

const CONCERN_LABELS: Record<string, string> = {
  acne: 'Anti Jerawat',
  brightening: 'Mencerahkan',
  'anti-aging': 'Anti Aging',
  hydrating: 'Melembapkan',
  pores: 'Mengecilkan Pori',
  soothing: 'Menenangkan',
  firming: 'Mengencangkan',
}

const SKIN_TYPE_LABELS: Record<string, string> = {
  oily: 'Berminyak',
  combination: 'Kombinasi',
  dry: 'Kering',
  sensitive: 'Sensitif',
  all: 'Semua Jenis Kulit',
}

export function ProductCard({ product }: Props) {
  const hasMarketplaceLink = product.tokopedia_url || product.shopee_url

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-gray-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 text-4xl">🧴</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          {product.usage_step && (
            <p className="text-xs text-[var(--color-accent)] uppercase tracking-wide mt-0.5">
              {product.usage_step}
            </p>
          )}
        </div>

        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}

        {product.concerns.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.concerns.slice(0, 2).map((concern) => (
              <span
                key={concern}
                className="text-xs px-2 py-0.5 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-full"
              >
                {CONCERN_LABELS[concern] ?? concern}
              </span>
            ))}
          </div>
        )}

        {product.skin_types.length > 0 && !product.skin_types.includes('all') && (
          <p className="text-xs text-gray-400">
            Untuk kulit: {product.skin_types.map(t => SKIN_TYPE_LABELS[t] ?? t).join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          {product.price ? (
            <span className="font-bold text-[var(--color-primary)]">
              Rp {product.price.toLocaleString('id-ID')}
            </span>
          ) : (
            <span className="text-sm text-gray-400">Hubungi untuk harga</span>
          )}

          {hasMarketplaceLink && (
            <div className="flex gap-2">
              {product.tokopedia_url && (
                <a
                  href={product.tokopedia_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                >
                  Tokopedia
                </a>
              )}
              {product.shopee_url && (
                <a
                  href={product.shopee_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                >
                  Shopee
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
