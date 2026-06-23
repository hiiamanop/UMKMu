import Image from 'next/image'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTenantBySlug } from '@/lib/tenant'
import { StoreFooter } from '@/components/store/store-footer'
import { ProductCard } from '@/components/store/product-card'

interface Props { params: Promise<{ slug: string }> }

const DEFAULT_SOURCES = [
  { title: 'Wildcrafting Etis', body: 'Kami bermitra langsung dengan petani lokal yang mempraktikkan wildcrafting berkelanjutan, memastikan setiap bahan dipanen tanpa merusak ekosistem.' },
  { title: 'Ekstraksi Cold-Press', body: 'Metode ekstraksi suhu rendah kami mempertahankan senyawa bioaktif dan fitokimia yang hilang pada proses pengolahan panas konvensional.' },
  { title: 'Kemurnian Klinis', body: 'Setiap batch diuji secara independen oleh laboratorium terakreditasi untuk memastikan kemurnian, potensi, dan keamanan sebelum dimasukkan ke dalam formula kami.' },
]

export default async function IngredientsPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const { tenant, products } = data
  const sources = (tenant.page_process_steps?.length === 3) ? tenant.page_process_steps : DEFAULT_SOURCES
  const heroTitle = tenant.page_ingredients_title || 'Dirawat oleh Alam'

  // Custom ingredients override auto-extracted ones from products
  const ingredients = tenant.page_ingredients_items?.length
    ? tenant.page_ingredients_items.map(item => ({ name: item.name, description: item.description }))
    : [...new Set(products.flatMap((p) => p.ingredients ?? []))].map(name => ({
        name,
        description: 'Bahan alami dengan khasiat teruji untuk merawat dan menjaga kesehatan kulit Anda.',
      }))
  const featuredProducts = products.slice(0, 4)

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative h-[600px] md:h-[819px] flex items-center justify-center overflow-hidden">
          {(tenant.page_ingredients_image_url ?? tenant.cta_image_url ?? tenant.hero_image_url) ? (
            <Image
              src={tenant.page_ingredients_image_url ?? tenant.cta_image_url ?? tenant.hero_image_url!}
              alt="Ingredients"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 text-center px-6 max-w-3xl">
            <span className="text-label-caps text-white/60 bg-white/10 px-3 py-1 mb-8 inline-block">OUR INGREDIENTS</span>
            <h1 className="text-display text-white">{heroTitle}</h1>
          </div>
        </section>

        {/* Main ingredients */}
        <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1280px] mx-auto">
          {ingredients.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16">
              {/* Featured ingredient */}
              <div className="md:col-span-4">
                <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
                  BAHAN UTAMA
                </span>
                <h2 className="text-headline-lg italic mb-6">{ingredients[0].name}</h2>
                <p className="text-body-md text-[var(--color-accent)]/70 leading-relaxed">
                  {ingredients[0].description}
                </p>
              </div>

              {/* Ingredient list */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                {ingredients.map((ing, i) => (
                  <div key={ing.name} className="border-t border-black/10 pt-6">
                    <div className="flex items-baseline gap-4 mb-3">
                      <span className="text-label-caps text-[10px] text-[var(--color-accent)]/40">{String(i + 1).padStart(2, '0')}</span>
                      <h3 className="text-headline-md italic">{ing.name}</h3>
                    </div>
                    <p className="text-body-md text-[var(--color-accent)]/60 leading-relaxed">{ing.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-body-lg text-[var(--color-accent)]/50">Informasi bahan akan segera tersedia.</p>
            </div>
          )}
        </section>

        {/* From Seed to Skin */}
        <section className="py-24 bg-[var(--color-secondary)] border-y border-black/5">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16">
            <div className="mb-16">
              <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
                PROSES KAMI
              </span>
              <h2 className="text-headline-lg">Dari Benih ke Kulit</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              {sources.map((s, i) => (
                <div key={s.title}>
                  <div className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-4">{String(i + 1).padStart(2, '0')}</div>
                  <h3 className="text-headline-md italic mb-4">{s.title}</h3>
                  <p className="text-body-md text-[var(--color-accent)]/70 leading-relaxed">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 md:px-16 bg-[var(--color-primary)] text-white text-center">
          <h2 className="text-headline-lg mb-6">Siap merasakan <i className="italic">perbedaannya</i>?</h2>
          <p className="text-body-md text-white/70 mb-10 max-w-lg mx-auto">
            Temukan produk yang diformulasikan dengan bahan-bahan terbaik pilihan alam untuk kulit yang lebih sehat dan bercahaya.
          </p>
          <Link
            href={`/store/${slug}/shop`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--color-primary)] text-label-caps hover:opacity-90 transition-opacity"
          >
            LIHAT KOLEKSI →
          </Link>
        </section>

        {/* Product grid */}
        {featuredProducts.length > 0 && (
          <section className="py-20 md:py-28 px-6 md:px-16 max-w-[1280px] mx-auto">
            <div className="mb-12">
              <span className="text-label-caps text-[var(--color-primary)] mb-2 block">PILIHAN PRODUK</span>
              <h2 className="text-headline-lg">Produk Unggulan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-14">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} slug={slug} />
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter tenant={tenant} />
    </>
  )
}
