import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { SuccessContent } from '@/components/subscribe/SuccessContent'

interface Props {
  searchParams: Promise<{ invoice?: string }>
}

export default async function SubscribeSuccessPage({ searchParams }: Props) {
  const { invoice: invoiceId } = await searchParams
  if (!invoiceId) notFound()

  const service = createServiceClient()
  const { data: inv } = await service
    .from('subscription_invoices')
    .select('id, plan_id, email, full_name, status, final_amount')
    .eq('id', invoiceId)
    .single()

  if (!inv) notFound()

  return <SuccessContent invoice={inv} isPaid={inv.status === 'paid'} />
}
