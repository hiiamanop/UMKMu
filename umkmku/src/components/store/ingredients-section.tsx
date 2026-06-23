import type { Product } from '@/lib/supabase/types'

interface Props {
  products: Product[]
}

const INGREDIENT_ICONS: Record<string, string> = {
  'niacinamide': '✦',
  'vitamin-c': '○',
  'retinol': '◈',
  'ceramide': '◇',
  'hyaluronic-acid': '◉',
  'bakuchiol': '✿',
  'aloe-vera': '❋',
  'jojoba': '◎',
  'green-tea': '❁',
  'chamomile': '✾',
}

const COLS = 5

export function IngredientsSection({ products }: Props) {
  const allIngredients = products.flatMap((p) => p.ingredients ?? [])
  const unique = [...new Set(allIngredients)].slice(0, 10)

  // Trim so last row has ≥ 3 items
  const remainder = unique.length % COLS
  const trimmed = remainder === 0 || remainder >= 3
    ? unique
    : unique.slice(0, unique.length - remainder)

  if (trimmed.length === 0) return null

  return (
    <section className="py-20 md:py-28 bg-[var(--color-secondary)] text-center">
      <div className="max-w-2xl mx-auto px-6 mb-16">
        <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
          OUR INGREDIENTS
        </span>
        <h2 className="text-headline-lg mb-4">
          Dirawat oleh <i className="italic">Alam</i>
        </h2>
        <p className="text-body-md text-[var(--color-accent)]/70">
          Produk kami dibuat dari bahan-bahan alami pilihan yang efektif merawat kulit dan ramah bagi bumi.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
          {trimmed.map((ing) => {
            const key = ing.toLowerCase().replace(/\s+/g, '-')
            const icon = INGREDIENT_ICONS[key] ?? '◉'
            return (
              <div key={ing} className="flex flex-col items-center w-24 group cursor-default">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  <span className="text-xl text-[var(--color-primary)]">{icon}</span>
                </div>
                <span className="text-label-caps text-[10px] tracking-widest text-[var(--color-accent)]/70 text-center leading-tight">
                  {ing.toUpperCase()}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
