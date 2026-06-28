import { createServiceClient } from '@/lib/supabase/server'
import { InvoicesClient } from './_invoices-client'

export default async function InvoicesPage() {
  const db = createServiceClient()

  const { data: invoices } = await db
    .from('subscription_invoices')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#0A2F73] mb-6">Invoice Subscription</h1>
      <InvoicesClient invoices={invoices ?? []} />
    </div>
  )
}
