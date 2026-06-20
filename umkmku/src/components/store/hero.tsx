import Image from 'next/image'
import type { Tenant } from '@/lib/supabase/types'

interface Props {
  tenant: Tenant
}

export function Hero({ tenant }: Props) {
  return (
    <section className="relative min-h-[70vh] flex items-center bg-[var(--color-secondary)]">
      {tenant.hero_image_url && (
        <Image
          src={tenant.hero_image_url}
          alt={`${tenant.brand_name} hero image`}
          fill
          className="object-cover opacity-20"
          priority
        />
      )}

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-lg">
          {tenant.logo_url ? (
            <Image
              src={tenant.logo_url}
              alt={`${tenant.brand_name} logo`}
              width={120}
              height={40}
              className="mb-6 object-contain"
            />
          ) : (
            <p className="text-sm font-medium tracking-widest uppercase text-[var(--color-accent)] mb-3">
              {tenant.brand_name}
            </p>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-primary)] leading-tight mb-4">
            {tenant.tagline ?? tenant.brand_name}
          </h1>

          {tenant.description && (
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {tenant.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <a
              href="#products"
              className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Lihat Produk
            </a>
            {tenant.whatsapp_number && (
              <a
                href={`https://wa.me/${tenant.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border-2 border-[var(--color-primary)] text-[var(--color-primary)] rounded-full font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors"
              >
                Hubungi Kami
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
