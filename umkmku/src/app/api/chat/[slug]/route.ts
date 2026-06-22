import { NextRequest } from 'next/server'
import { buildChatbotSystemPrompt } from '@/lib/ai/chatbot'
import { createServiceClient } from '@/lib/supabase/server'

const MAX_MESSAGES = 10
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL?.replace('/v1', '') ?? 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'gemma4:12b'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const supabase = createServiceClient()

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!tenant) {
    return new Response('Toko tidak ditemukan', { status: 404 })
  }

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .eq('is_active', true)
    .order('sort_order')

  const body = await request.json()
  const messages: { role: string; content: string }[] = body.messages ?? []

  if (messages.length > MAX_MESSAGES) {
    return new Response(
      JSON.stringify({ error: 'Sesi chat sudah mencapai batas.' }),
      { status: 429 }
    )
  }

  const systemPrompt = buildChatbotSystemPrompt(tenant, products ?? [])

  // Panggil Ollama native API langsung (bypass AI SDK)
  const ollamaRes = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
      think: false,
      options: { num_predict: 500 },
    }),
  })

  if (!ollamaRes.ok || !ollamaRes.body) {
    return new Response('Gagal menghubungi AI', { status: 502 })
  }

  // Stream teks dari Ollama ke client
  const encoder = new TextEncoder()
  const ollamaReader = ollamaRes.body.getReader()
  const decoder = new TextDecoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await ollamaReader.read()
          if (done) break
          const lines = decoder.decode(value, { stream: true }).split('\n').filter(Boolean)
          for (const line of lines) {
            try {
              const json = JSON.parse(line)
              const token = json?.message?.content ?? ''
              if (token) controller.enqueue(encoder.encode(token))
              if (json?.done) {
                controller.close()
                return
              }
            } catch {
              // skip baris yang tidak lengkap (streaming chunk boundary)
            }
          }
        }
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
