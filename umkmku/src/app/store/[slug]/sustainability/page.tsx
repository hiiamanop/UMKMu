import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { StoreFooter } from '@/components/store/store-footer'
import { ProductCard } from '@/components/store/product-card'

interface Props { params: Promise<{ slug: string }> }

const DEFAULT_INITIATIVES = [
  { title: 'Bahan Bersumber Etis', body: 'Kami bermitra eksklusif dengan petani kecil bersertifikat yang menjaga keanekaragaman hayati. Setiap pembelian langsung mendukung mata pencaharian mereka.' },
  { title: 'Kemasan Nol Limbah', body: 'Kemasan kami 100% dapat didaur ulang atau terurai secara hayati. Kami menghilangkan plastik sekali pakai dari seluruh rantai pasokan kami sejak 2023.' },
  { title: 'Karbon Netral', body: 'Operasi kami 100% ditenagai energi terbarukan dan kami mengimbangi jejak karbon yang tersisa melalui program reforestasi terverifikasi di Indonesia.' },
]

const DEFAULT_STATS = [
  { value: '100%', label: 'Bahan alami terverifikasi' },
  { value: '0%', label: 'Plastik sekali pakai' },
  { value: '50+', label: 'Mitra petani lokal' },
  { value: '2x', label: 'Dikembalikan ke alam dari setiap penjualan' },
]

export default async function SustainabilityPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const { tenant, products } = data
  const initiatives = (tenant.page_sustainability?.length === 3) ? tenant.page_sustainability : DEFAULT_INITIATIVES
  const stats = (tenant.page_stats?.length === 4) ? tenant.page_stats : DEFAULT_STATS
  const featuredProducts = products.slice(0, 4)

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative h-[600px] md:h-[819px] flex items-end overflow-hidden">
          {(tenant.page_sustainability_image_url ?? tenant.about_image_2_url ?? tenant.hero_image_url) ? (
            <Image
              src={tenant.page_sustainability_image_url ?? tenant.about_image_2_url ?? tenant.hero_image_url!}
              alt="Sustainability"
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 px-8 md:px-16 pb-16 md:pb-24 max-w-3xl">
            <span className="text-label-caps text-white/60 bg-white/10 px-3 py-1 mb-8 inline-block">KEBERLANJUTAN</span>
            <h1 className="text-display text-white">
              Planet yang <i className="italic">sehat,</i> kulit yang sehat.
            </h1>
          </div>
        </section>

        {/* Key initiatives */}
        <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1280px] mx-auto">
          <div className="mb-16">
            <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
              INISIATIF KAMI
            </span>
            <h2 className="text-headline-lg max-w-lg">
              Tanggung jawab kami terhadap <i className="italic">bumi</i>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {initiatives.map((item, i) => (
              <div key={i} className="border-t border-black/10 pt-8">
                <span className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-4 block">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="text-headline-md italic mb-4">{item.title}</h3>
                <p className="text-body-md text-[var(--color-accent)]/70 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Image + text */}
        <section className="py-24 bg-[var(--color-secondary)]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[480px] overflow-hidden">
              {(tenant.page_sustainability_story_image_url ?? tenant.cta_image_url ?? tenant.hero_image_url) ? (
                <Image
                  src={tenant.page_sustainability_story_image_url ?? tenant.cta_image_url ?? tenant.hero_image_url!}
                  alt="Nature"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--color-accent)]/20" />
              )}
            </div>
            <div>
              <h2 className="text-headline-lg mb-6">
                {tenant.page_sustainability_story_title ?? <>Setiap pilihan <i className="italic">membuat perbedaan</i></>}
              </h2>
              <p className="text-body-lg text-[var(--color-accent)]/70 leading-relaxed mb-6">
                {tenant.page_sustainability_story_body ?? 'Keberlanjutan bukan sekadar kata-kata bagi kami — ini adalah inti dari setiap keputusan yang kami buat, dari cara kami mendapatkan bahan baku hingga bagaimana kami mengemas produk kami.'}
              </p>
              <p className="text-body-md text-[var(--color-accent)]/60 leading-relaxed">
                Ketika Anda memilih {tenant.brand_name}, Anda bergabung dengan gerakan yang lebih besar: mendukung petani lokal, melindungi ekosistem, dan membangun masa depan kecantikan yang lebih berkelanjutan.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 px-6 md:px-16 border-b border-black/5">
          <div className="max-w-[1280px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-display italic text-[var(--color-primary)] mb-2 leading-none">{s.value}</div>
                <p className="text-label-caps text-[10px] text-[var(--color-accent)]/60 leading-relaxed">{s.label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 px-6 md:px-16 bg-[var(--color-secondary)]">
          <div className="max-w-[1280px] mx-auto">
            <p className="text-label-caps text-[var(--color-accent)]/40 text-center mb-10">KOMITMEN & SERTIFIKASI</p>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-6">
              {['Cruelty-Free', 'Vegan', 'BPOM Certified', 'Eco-Packaging', 'Halal Friendly'].map((cert) => (
                <span key={cert} className="text-label-caps text-[var(--color-accent)]/50 border border-black/10 px-4 py-2">
                  {cert}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 px-6 bg-[var(--color-primary)] text-white text-center">
          <h2 className="text-headline-lg mb-6">
            Bergabunglah dalam <i className="italic">perjalanan</i> ini
          </h2>
          <p className="text-body-md text-white/70 mb-10 max-w-lg mx-auto">
            Setiap produk yang Anda pilih adalah langkah menuju kecantikan yang lebih bertanggung jawab dan planet yang lebih sehat.
          </p>
          <Link
            href={`/store/${slug}/shop`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[var(--color-primary)] text-label-caps hover:opacity-90 transition-opacity"
          >
            BELANJA SEKARANG →
          </Link>
        </section>

        {/* Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 md:py-28 px-6 md:px-16 max-w-[1280px] mx-auto">
            <div className="mb-12">
              <span className="text-label-caps text-[var(--color-primary)] mb-2 block">PRODUK KAMI</span>
              <h2 className="text-headline-lg">Pilihan <i className="italic">Berkelanjutan</i></h2>
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
