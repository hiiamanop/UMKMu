import type { Tenant } from '@/lib/supabase/types'

interface Props {
  tenant: Tenant
}

export function StoreFooter({ tenant }: Props) {
  return (
    <footer className="bg-[var(--color-primary)] text-white py-8">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-semibold">{tenant.brand_name}</span>
        <span className="text-xs text-white/50">
          Powered by{' '}
          <a
            href="https://umkmku.com"
            className="underline hover:text-white transition-colors"
          >
            UMKMku.com
          </a>
        </span>
      </div>
    </footer>
  )
}
