'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { Tenant } from '@/lib/supabase/types'
import { updateChatbot } from '../actions'

interface Props {
  tenant: Tenant
}

export function ChatbotForm({ tenant }: Props) {
  const [state, action, pending] = useActionState(
    async (_: unknown, formData: FormData) => {
      return updateChatbot(tenant.slug, formData)
    },
    null
  )

  return (
    <div className="bg-white rounded-xl p-6 space-y-6">
      <h2 className="font-semibold text-lg">Pengaturan Chatbot</h2>

      <form action={action} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nama Beauty Advisor</label>
          <Input
            name="chatbot_name"
            defaultValue={tenant.chatbot_name ?? 'Beauty Advisor'}
            placeholder="Beauty Advisor"
            required
          />
          <p className="text-xs text-gray-500">Nama yang akan muncul di chatbot toko kamu</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Kepribadian Chatbot</label>
          <Textarea
            name="chatbot_persona"
            defaultValue={tenant.chatbot_persona ?? ''}
            placeholder="Contoh: Ramah, informatif, dan selalu memberikan rekomendasi yang personal. Gunakan bahasa yang hangat dan profesional."
            className="min-h-[120px]"
          />
          <p className="text-xs text-gray-500">Deskripsikan bagaimana chatbot kamu berbicara dengan customer</p>
        </div>

        {state?.error && <p className="text-red-600 text-sm">{state.error}</p>}
        {state?.success && <p className="text-green-600 text-sm">Pengaturan chatbot disimpan!</p>}

        <Button type="submit" disabled={pending}>
          {pending ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </Button>
      </form>
    </div>
  )
}
