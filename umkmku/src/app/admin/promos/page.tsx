import { createServiceClient } from '@/lib/supabase/server'
import { PromoAdminClient } from './_promo-client'

export default async function PromosPage() {
  const db = createServiceClient()
  const { data: promos } = await db
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-6">Kode Promo</h1>
      <PromoAdminClient initialPromos={promos ?? []} />
    </div>
  )
}
