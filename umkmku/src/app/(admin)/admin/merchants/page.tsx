import { createServiceClient } from '@/lib/supabase/server'

export default async function MerchantsPage() {
  const db = createServiceClient()
  const { data: tenants } = await db
    .from('tenants')
    .select('id, slug, brand_name, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-6">Semua Merchant</h1>
      <MerchantTable tenants={tenants ?? []} />
    </div>
  )
}

function MerchantTable({ tenants }: { tenants: { id: string; slug: string; brand_name: string; category: string; created_at: string }[] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-5 py-3 font-medium text-gray-500">Brand</th>
            <th className="text-left px-5 py-3 font-medium text-gray-500">Slug</th>
            <th className="text-left px-5 py-3 font-medium text-gray-500">Kategori</th>
            <th className="text-left px-5 py-3 font-medium text-gray-500">Bergabung</th>
          </tr>
        </thead>
        <tbody>
          {!tenants.length && (
            <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Belum ada merchant</td></tr>
          )}
          {tenants.map((t) => (
            <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
              <td className="px-5 py-4 font-medium text-gray-800">{t.brand_name}</td>
              <td className="px-5 py-4 text-gray-500">{t.slug}</td>
              <td className="px-5 py-4">
                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                  {t.category}
                </span>
              </td>
              <td className="px-5 py-4 text-gray-400">
                {new Date(t.created_at).toLocaleDateString('id-ID')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
