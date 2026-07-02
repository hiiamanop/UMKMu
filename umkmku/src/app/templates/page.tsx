import { createServiceClient } from '@/lib/supabase/server'
import { TemplatesContent } from '@/components/templates/TemplatesContent'

export const metadata = {
  title: 'Templates, UMKMu',
  description: 'Pilih template toko untuk brandmu. Tersedia berbagai desain untuk skincare, parfum, fashion, dan F&B.',
}

export default async function TemplatesPage() {
  const supabase = createServiceClient()
  const { data: templates } = await supabase
    .from('templates')
    .select('id, name, description, category, template_key, preview_urls, demo_url')
    .eq('is_active', true)
    .order('category')
    .order('created_at')

  return <TemplatesContent templates={templates ?? []} />
}
