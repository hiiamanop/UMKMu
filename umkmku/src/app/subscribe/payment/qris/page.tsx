import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { QrisPaymentClient } from './_qris-client'

const PLAN_NAMES: Record<string, string> = { business: 'Business', enterprise: 'Enterprise' }

interface Props {
  searchParams: Promise<{ id?: string }>
}

export default async function QrisPaymentPage({ searchParams }: Props) {
  const { id } = await searchParams
  if (!id) notFound()

  const db = createServiceClient()
  const { data: invoice } = await db
    .from('subscription_invoices')
    .select('id, plan_id, full_name, email, final_amount, status, created_at')
    .eq('id', id)
    .single()

  if (!invoice) notFound()

  const { data: setting } = await db.from('platform_settings').select('value').eq('key', 'qris_url').maybeSingle()
  const qrisUrl = setting?.value ?? process.env.PLATFORM_QRIS_URL ?? null

  return (
    <QrisPaymentClient
      invoiceId={invoice.id}
      planName={PLAN_NAMES[invoice.plan_id] ?? invoice.plan_id}
      fullName={invoice.full_name ?? ''}
      email={invoice.email}
      amount={invoice.final_amount}
      qrisUrl={qrisUrl}
      isPaid={invoice.status === 'paid'}
      createdAt={invoice.created_at}
    />
  )
}
