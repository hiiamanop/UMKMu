import { createServiceClient } from '@/lib/supabase/server'

export default async function OngoingPage() {
  const db = createServiceClient()
  const { data } = await db
    .from('tenant_subscriptions')
    .select('id, plan_id, current_period_end, tenants(slug, brand_name)')
    .eq('status', 'active')
    .order('current_period_end', { ascending: true })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-2">Ongoing</h1>
      <p className="text-sm text-[#5E6B85] mb-6">Merchant dengan langganan aktif — {data?.length ?? 0} merchant</p>
      <div className="bg-white rounded-xl border border-[#E5EAF0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E5EAF0]">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Brand</th>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Plan</th>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Berakhir</th>
            </tr>
          </thead>
          <tbody>
            {!data?.length && (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-[#5E6B85]">Tidak ada merchant aktif</td></tr>
            )}
            {data?.map((s) => {
              const tenant = Array.isArray(s.tenants) ? s.tenants[0] : s.tenants
              return (
                <tr key={s.id} className="border-b border-[#E5EAF0] last:border-0 hover:bg-[#F8FAFC]">
                  <td className="px-5 py-4 font-medium text-[#0A2F73]">{tenant?.brand_name ?? '-'}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium capitalize">{s.plan_id}</span>
                  </td>
                  <td className="px-5 py-4 text-[#5E6B85]">
                    {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('id-ID') : '-'}
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
