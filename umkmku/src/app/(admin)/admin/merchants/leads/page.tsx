import { createServiceClient } from '@/lib/supabase/server'

export default async function LeadsPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('tenant_subscriptions')
    .select('id, trial_ends_at, tenants(slug, brand_name, category, created_at)')
    .eq('status', 'trial')
    .order('trial_ends_at', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-2">Leads</h1>
      <p className="text-sm text-gray-500 mb-6">Merchant yang sedang trial gratis</p>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Brand</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Kategori</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Trial Berakhir</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Sisa</th>
            </tr>
          </thead>
          <tbody>
            {!data?.length && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-gray-400">Tidak ada leads</td></tr>
            )}
            {data?.map((s) => {
              const tenant = Array.isArray(s.tenants) ? s.tenants[0] : s.tenants
              const daysLeft = s.trial_ends_at
                ? Math.ceil((new Date(s.trial_ends_at).getTime() - Date.now()) / 86400000)
                : null
              return (
                <tr key={s.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-800">{tenant?.brand_name ?? '-'}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium capitalize">
                      {tenant?.category ?? '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400">
                    {s.trial_ends_at ? new Date(s.trial_ends_at).toLocaleDateString('id-ID') : '-'}
                  </td>
                  <td className="px-5 py-4">
                    {daysLeft !== null && (
                      <span className={`text-xs font-semibold ${daysLeft <= 1 ? 'text-red-600' : daysLeft <= 3 ? 'text-yellow-600' : 'text-gray-500'}`}>
                        {daysLeft <= 0 ? 'Habis' : `${daysLeft} hari`}
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
