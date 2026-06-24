import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { StoreFooter } from '@/components/store/store-footer'
import { ProductCard } from '@/components/store/product-card'
import { ProductDetailClient } from './_product-detail-client'

interface Props {
  params: Promise<{ slug: string; id: string }>
}

const SHIPPING_TEXT = 'Pengiriman gratis untuk pembelian di atas Rp 300.000. Kami menerima pengembalian dalam 7 hari untuk produk yang belum dibuka. Kemasan kami 100% dapat didaur ulang.'

export default async function ProductDetailPage({ params }: Props) {
  const { slug, id } = await params
  const supabase = createServiceClient()

  const [{ data: tenant }, { data: product }] = await Promise.all([
    supabase.from('tenants').select('*').eq('slug', slug).single(),
    supabase.from('products').select('*').eq('id', id).single(),
  ])

  if (!tenant || !product) notFound()

  const { data: related } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .neq('id', id)
    .eq('is_active', true)
    .limit(4)

  const marketplaceUrl = product.tokopedia_url || product.shopee_url

  const accordions = [
    {
      key: 'how_to_use',
      label: 'CARA PENGGUNAAN',
      content: product.how_to_use ?? product.description ?? 'Gunakan secukupnya pada kulit yang sudah bersih. Aplikasikan dengan gerakan memutar lembut hingga meresap sempurna.',
    },
    {
      key: 'ingredients',
      label: 'DAFTAR BAHAN',
      content: (product.ingredients ?? []).length > 0
        ? product.ingredients.join(', ')
        : 'Hubungi kami untuk informasi lengkap bahan-bahan produk ini.',
    },
    { key: 'shipping', label: 'PENGIRIMAN & PENGEMBALIAN', content: SHIPPING_TEXT },
  ]

  return (
    <>
      <main className="max-w-[1280px] mx-auto">
        {/* Product Hero — 7/5 grid */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 px-6 md:px-16 py-16 md:py-24">
          {/* Image */}
          <div className="md:col-span-7 flex justify-center items-start">
            <div className="w-full aspect-[4/5] bg-[var(--color-secondary)] relative overflow-hidden group">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-10">🧴</div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-5 flex flex-col justify-center">
            {product.usage_step && (
              <div className="mb-4">
                <span className="text-label-caps bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1">
                  {product.usage_step.toUpperCase()}
                </span>
              </div>
            )}

            <h1 className="text-headline-lg italic text-[var(--color-primary)] mb-3">{product.name}</h1>

            {product.price && (
              <p className="text-body-lg text-[var(--color-accent)]/60 mb-6">
                IDR {product.price.toLocaleString('id-ID')}
              </p>
            )}

            {product.description && (
              <p className="text-body-md text-[var(--color-accent)]/70 leading-relaxed italic mb-8 border-l-2 border-[var(--color-primary)]/30 pl-5">
                {product.description}
              </p>
            )}

            {/* Ingredient chips */}
            {(product.ingredients ?? []).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {product.ingredients.slice(0, 5).map((ing: string) => (
                  <span key={ing} className="text-label-caps text-[10px] bg-[var(--color-secondary)] border border-black/10 px-3 py-1.5 rounded-full">
                    {ing.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Interactive: buy button + accordion */}
            <ProductDetailClient accordions={accordions} product={{ id: product.id, name: product.name, price: product.price, image_url: product.image_url }} />
          </div>
        </section>

        {/* Nourished by Nature */}
        <section className="px-6 md:px-16 py-24 bg-[var(--color-secondary)] flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-display italic text-[var(--color-primary)] mb-6">
              Dirawat oleh Alam
            </h2>
            <p className="text-body-lg text-[var(--color-accent)]/70 leading-relaxed max-w-lg">
              Kami percaya perawatan kulit adalah perpanjangan dari kecerdasan alam.
              Setiap produk dibuat dari bahan-bahan alami pilihan yang dipanen pada puncak kualitasnya.
            </p>
          </div>
          <div className="w-full md:w-1/2 h-[400px] overflow-hidden relative bg-[var(--color-accent)]/20">
            {tenant.hero_image_url && (
              <Image src={tenant.hero_image_url} alt="Nature" fill sizes="50vw" className="object-cover" />
            )}
          </div>
        </section>

        {/* Complete your Ritual */}
        {(related ?? []).length > 0 && (
          <section className="px-6 md:px-16 py-20">
            <h3 className="text-headline-lg italic text-[var(--color-primary)] mb-10">
              Lengkapi Ritual Kamu
            </h3>
            <div className="flex gap-8 overflow-x-auto pb-6">
              {(related ?? []).map((rp) => (
                <div key={rp.id} className="flex-shrink-0 w-64">
                  <ProductCard product={rp} slug={slug} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <StoreFooter tenant={tenant} />
    </>
  )
}
