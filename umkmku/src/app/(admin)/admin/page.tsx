import { createServiceClient } from '@/lib/supabase/server'

export default async function AdminOverview() {
  const db = createServiceClient()

  const [{ count: totalMerchants }, { count: ongoing }, { count: leads }, { count: articles }] = await Promise.all([
    db.from('tenants').select('*', { count: 'exact', head: true }),
    db.from('tenant_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    db.from('tenant_subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'trial'),
    db.from('articles').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Total Merchant', value: totalMerchants ?? 0 },
    { label: 'Ongoing (Aktif)', value: ongoing ?? 0 },
    { label: 'Leads (Trial)', value: leads ?? 0 },
    { label: 'Total Artikel', value: articles ?? 0 },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-6">Overview</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="text-3xl font-bold text-[#0A2F73]">{s.value}</div>
            <div className="text-sm text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
