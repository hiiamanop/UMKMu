import { getTenantBySlug } from '@/lib/tenant'
import { notFound } from 'next/navigation'
import { ChatbotForm } from '../_components/chatbot-form'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ChatbotPage({ params }: Props) {
  const { slug } = await params
  const data = await getTenantBySlug(slug)

  if (!data) notFound()

  return <ChatbotForm tenant={data.tenant} />
}
