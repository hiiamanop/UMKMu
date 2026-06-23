import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { StoreFooter } from '@/components/store/store-footer'
import { ProductCard } from '@/components/store/product-card'

interface Props { params: Promise<{ slug: string }> }

const DEFAULT_COMMITMENTS = [
  { title: 'Kemurnian', body: 'Hanya bahan-bahan terpilih yang melewati seleksi ketat kami untuk memastikan setiap produk aman, efektif, dan bebas dari bahan berbahaya.' },
  { title: 'Transparansi', body: 'Kami terbuka tentang setiap bahan, sumber, dan proses pembuatan. Tidak ada bahan tersembunyi, tidak ada klaim palsu.' },
  { title: 'Keberlanjutan', body: 'Dari bahan baku hingga kemasan, kami berkomitmen pada praktik ramah lingkungan yang melindungi bumi untuk generasi mendatang.' },
  { title: 'Efektivitas', body: 'Setiap formula dirancang berdasarkan penelitian ilmiah untuk memberikan hasil nyata yang bisa Anda rasakan sejak pemakaian pertama.' },
]

export default async function AboutPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const { tenant, products } = data
  const featuredProducts = products.slice(0, 4)
  const commitments = (tenant.page_commitments?.length === 4) ? tenant.page_commitments : DEFAULT_COMMITMENTS
  const storyText = tenant.page_about_story ?? tenant.description ?? `${tenant.brand_name} lahir dari keyakinan sederhana: bahwa setiap orang berhak mendapatkan produk perawatan kulit yang benar-benar efektif, aman, dan dibuat dengan integritas.`

  return (
    <>
      <main>
        {/* Hero */}
        <section className="relative h-[600px] md:h-[870px] flex items-center overflow-hidden">
          {(tenant.page_about_image_url ?? tenant.hero_image_url) ? (
            <Image src={tenant.page_about_image_url ?? tenant.hero_image_url!} alt="About us" fill sizes="100vw" className="object-cover" priority />
          ) : (
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, var(--color-accent), var(--color-primary))' }} />
          )}
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 px-8 md:px-16 max-w-3xl">
            <span className="text-label-caps text-white/60 bg-white/10 px-3 py-1 mb-8 inline-block">TENTANG KAMI</span>
            <h1 className="text-display text-white leading-tight">
              {tenant.tagline ? (
                <><i className="italic">{tenant.tagline}</i></>
              ) : (
                <>Kecantikan yang <i className="italic">Jujur</i></>
              )}
            </h1>
          </div>
        </section>

        {/* Commitments */}
        <section className="py-24 md:py-32 px-6 md:px-16 max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
            <div className="md:col-span-5">
              <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
                KOMITMEN KAMI
              </span>
              <h2 className="text-headline-lg leading-snug">
                Nilai-nilai yang <i className="italic">tidak pernah</i> kami kompromikan.
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            {commitments.map((c, i) => (
              <div key={i} className="border-t border-black/10 pt-8">
                <span className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-4 block">{String(i + 1).padStart(2, '0')} / 04</span>
                <h3 className="text-headline-md italic mb-4">{c.title}</h3>
                <p className="text-body-md text-[var(--color-accent)]/70 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story section */}
        <section className="py-24 bg-[var(--color-secondary)]">
          <div className="max-w-[1280px] mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[500px] overflow-hidden">
              {(tenant.page_about_story_image_url ?? tenant.about_image_1_url ?? tenant.hero_image_url) ? (
                <Image
                  src={tenant.page_about_story_image_url ?? tenant.about_image_1_url ?? tenant.hero_image_url!}
                  alt="Our story"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--color-accent)]/20" />
              )}
            </div>
            <div>
              <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
                KISAH KAMI
              </span>
              <h2 className="text-headline-lg mb-6">
                Awal dari sebuah <i className="italic">impian</i>
              </h2>
              <p className="text-body-lg text-[var(--color-accent)]/70 leading-relaxed mb-6">
                {storyText}
              </p>
              {(tenant.instagram_url || tenant.whatsapp_number) && (
                <div className="flex gap-4 flex-wrap">
                  {tenant.instagram_url && (
                    <a href={tenant.instagram_url} target="_blank" rel="noopener noreferrer"
                      className="text-label-caps text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-0.5">
                      Instagram →
                    </a>
                  )}
                  {tenant.whatsapp_number && (
                    <a href={`https://wa.me/${tenant.whatsapp_number.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="text-label-caps text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-0.5">
                      WhatsApp →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Brand values */}
        <section className="py-24 px-6 md:px-16 max-w-[1280px] mx-auto text-center">
          <h2 className="text-display italic text-[var(--color-primary)] leading-none mb-16">
            {tenant.brand_name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {['Alami', 'Efektif', 'Berkelanjutan'].map((val) => (
              <div key={val} className="border-t border-black/10 pt-8">
                <h3 className="text-headline-lg italic mb-3">{val}</h3>
                <p className="text-body-md text-[var(--color-accent)]/60">Inti dari setiap produk yang kami ciptakan.</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-[var(--color-secondary)] text-center px-6">
          <span className="text-label-caps text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1 mb-6 inline-block">
            MULAI PERJALANANMU
          </span>
          <h2 className="text-headline-lg mb-8">Temukan produk yang <i className="italic">tepat</i> untukmu</h2>
          <Link
            href={`/store/${slug}/shop`}
            className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--color-primary)] text-white text-label-caps hover:opacity-90 transition-opacity"
          >
            LIHAT KOLEKSI →
          </Link>
        </section>

        {/* Products */}
        {featuredProducts.length > 0 && (
          <section className="py-20 md:py-28 px-6 md:px-16 max-w-[1280px] mx-auto">
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
