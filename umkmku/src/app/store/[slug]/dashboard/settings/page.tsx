import { SettingsPage } from '@/components/dashboard/SettingsPage'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function SettingsPageRoute({ params }: Props) {
  const { slug } = await params

  return <SettingsPage />
}
