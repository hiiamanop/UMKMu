import type { Product } from '@/lib/supabase/types'
import { ProductCard } from './product-card'

interface Props {
  products: Product[]
}

export function ProductGrid({ products }: Props) {
  if (products.length === 0) {
    return (
      <section id="products" className="max-w-5xl mx-auto px-6 py-16">
        <p className="text-center text-gray-400">Produk segera hadir.</p>
      </section>
    )
  }

  return (
    <section id="products" className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-8">
        Produk Kami
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
