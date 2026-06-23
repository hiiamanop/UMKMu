import { redirect } from 'next/navigation'

export default async function PagesIndex({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  redirect(`/${slug}/pages/about`)
}
