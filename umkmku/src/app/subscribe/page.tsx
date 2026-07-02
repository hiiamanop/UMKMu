import { SubscribeContent } from '@/components/subscribe/SubscribeContent'

interface Props {
  searchParams: Promise<{ slug?: string }>
}

export default async function SubscribePage({ searchParams }: Props) {
  const { slug = '' } = await searchParams
  return <SubscribeContent slug={slug} />
}
