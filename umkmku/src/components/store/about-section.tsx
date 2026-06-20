import type { Tenant } from '@/lib/supabase/types'

interface Props {
  tenant: Tenant
}

export function AboutSection({ tenant }: Props) {
  return (
    <section className="bg-[var(--color-secondary)] py-16">
      <div className="max-w-5xl mx-auto px-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-4">
            Tentang {tenant.brand_name}
          </h2>
          {tenant.description && (
            <p className="text-gray-600 leading-relaxed">{tenant.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-4">
            {tenant.whatsapp_number && (
              <a
                href={`https://wa.me/${tenant.whatsapp_number.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-accent)] underline"
              >
                WhatsApp
              </a>
            )}
            {tenant.instagram_url && (
              <a
                href={tenant.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[var(--color-accent)] underline"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
