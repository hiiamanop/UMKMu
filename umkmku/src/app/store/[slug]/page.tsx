import { notFound } from 'next/navigation'
import { getTenantBySlug } from '@/lib/tenant'
import { Hero } from '@/components/store/hero'
import { ProductGrid } from '@/components/store/product-grid'
import { AboutSection } from '@/components/store/about-section'
import { StoreFooter } from '@/components/store/store-footer'
import { ChatbotWidgetLoader } from '@/components/store/chatbot-widget-loader'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  const { tenant, products } = data

  return (
    <>
      <Hero tenant={tenant} />
      <ProductGrid products={products} />
      <AboutSection tenant={tenant} />
      <StoreFooter tenant={tenant} />
      <ChatbotWidgetLoader tenant={tenant} products={products} />
    </>
  )
}
