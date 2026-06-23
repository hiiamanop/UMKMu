import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { AppearanceForm } from '../_components/appearance-form'
import { TestimonialsForm } from '../_components/testimonials-form'
import type { Testimonial } from '@/lib/supabase/types'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function AppearancePage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)
  if (!data) notFound()

  const supabase = createServiceClient()
  const { data: testimonials } = await supabase
    .from('testimonials')
    .select('*')
    .eq('tenant_id', data.tenant.id)
    .order('sort_order')

  return (
    <div className="space-y-6">
      <AppearanceForm tenant={data.tenant} />
      <TestimonialsForm slug={slug} testimonials={(testimonials ?? []) as Testimonial[]} />
    </div>
  )
}
