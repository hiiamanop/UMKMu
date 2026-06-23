import type { Product } from '@/lib/supabase/types'
import { ProductCard } from './product-card'

interface Props {
  products: Product[]
  slug?: string
}

export function ProductGrid({ products, slug }: Props) {
  const visible = products.slice(0, 6)
  if (visible.length === 0) return null

  return (
    <section id="products" className="py-20 md:py-28 px-6 md:px-16 bg-[var(--color-secondary)] max-w-[1280px] mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} slug={slug} />
        ))}
      </div>
    </section>
  )
}
