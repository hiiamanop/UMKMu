import { redirect } from 'next/navigation'
import { calculatePricingBreakdown } from '@/lib/utils/pricing'
import { CheckoutContent } from '@/components/subscribe/CheckoutContent'

const PLANS: Record<string, { id: string; name: string; price: number }> = {
  business:   { id: 'business',   name: 'Business',   price: 10000 },
  enterprise: { id: 'enterprise', name: 'Enterprise',  price: 599000 },
}

interface Props {
  searchParams: Promise<{ plan?: string; slug?: string }>
}

export default async function CheckoutPage({ searchParams }: Props) {
  const { plan: planKey = 'business', slug } = await searchParams
  const plan = PLANS[planKey]
  if (!plan) redirect('/subscribe')

  const pricing = calculatePricingBreakdown(plan.price, false)

  return <CheckoutContent plan={plan} pricing={pricing} slug={slug} />
}
