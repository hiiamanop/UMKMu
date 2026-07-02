import { PaymentContent } from '@/components/subscribe/PaymentContent'

const PLAN_PRICES: Record<string, number> = {
  business: 10000,
  enterprise: 599000,
}
const PLAN_NAMES: Record<string, string> = {
  business: 'Business',
  enterprise: 'Enterprise',
}

interface Props {
  searchParams: Promise<{ plan?: string; slug?: string }>
}

export default async function PaymentPage({ searchParams }: Props) {
  const { plan: planKey = 'business', slug = '' } = await searchParams
  return (
    <PaymentContent
      planName={PLAN_NAMES[planKey] ?? planKey}
      planPrice={PLAN_PRICES[planKey] ?? 10000}
      slug={slug}
    />
  )
}
