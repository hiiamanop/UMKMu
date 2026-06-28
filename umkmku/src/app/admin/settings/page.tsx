import { createServiceClient } from '@/lib/supabase/server'
import { SettingsClient } from './_settings-client'

export default async function SettingsPage() {
  const db = createServiceClient()
  const { data: rows } = await db.from('platform_settings').select('key, value')
  const s = Object.fromEntries((rows ?? []).map(r => [r.key, r.value]))

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-6">Pengaturan Platform</h1>
      <SettingsClient
        qrisUrl={s.qris_url ?? ''}
        qrisMerchantName={s.qris_merchant_name ?? ''}
        supportPhone={s.support_phone ?? ''}
        supportEmail={s.support_email ?? ''}
      />
    </div>
  )
}
