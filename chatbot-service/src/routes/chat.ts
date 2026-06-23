import { Router, Request, Response } from 'express'
import { getTenantConfig, getProducts } from '../services/config-cache.js'
import { rankProductsForRecommendation } from '../services/category-matcher.js'
import { createClient } from '@supabase/supabase-js'

const router = Router()

interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

// Session-based rate limiting (simple in-memory store)
const sessionMessageCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX_MESSAGES = 10

/**
 * Check and update rate limit for a session
 * @returns true if within limit, false if rate limited
 */
function checkRateLimit(sessionId: string): boolean {
  const now = Date.now()
  const entry = sessionMessageCounts.get(sessionId)

  if (!entry || now > entry.resetTime) {
    // Reset or create new entry
    sessionMessageCounts.set(sessionId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX_MESSAGES) {
    return false
  }

  entry.count++
  return true
}

/**
 * Parse recommendation tokens from response text
 * Format: [[RECOMMEND:product_uuid]]
 * @returns Array of product UUIDs
 */
function parseRecommendations(text: string): string[] {
  const recommendations: string[] = []
  const regex = /\[\[RECOMMEND:([a-f0-9-]+)\]\]/g
  let match

  while ((match = regex.exec(text)) !== null) {
    recommendations.push(match[1])
  }

  return recommendations
}

/**
 * Build category-specific system prompt
 */
function buildSystemPrompt(
  category: string,
  brandName: string,
  description: string,
  chatbotName: string,
  chatbotPersona: string,
  productsJson: string
): string {
  // Category-specific prompts
  const categoryPrompts: Record<string, string> = {
    skincare: `Kamu adalah skincare advisor untuk {brand_name}.

Tentang brand:
{description}

Produk tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan skin type jika belum disebutkan
2. Tanyakan concern utama (acne, brightening, anti-aging, hydrating, pores, atau sensitive)
3. Rekomendasikan maksimal 2 produk yang paling relevan
4. Jelaskan MENGAPA produk itu cocok untuk mereka
5. Gunakan Bahasa Indonesia yang ramah dan profesional
6. Jangan buat klaim medis
7. Jangan sebut kompetitor
8. Jika customer tertarik dengan satu produk, akhiri responsmu dengan: [[RECOMMEND:product_uuid]]
9. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi`,

    parfum: `Kamu adalah fragrance advisor untuk {brand_name}.

Tentang brand:
{description}

Produk tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan preferensi aroma (floral, woody, fresh, oriental, atau chypre)
2. Tanyakan occasion (daily, special, formal, casual)
3. Tanyakan apakah customer lebih suka fragrance yang bertahan lama atau ringan
4. Rekomendasikan maksimal 2 produk yang paling sesuai
5. Jelaskan profil aroma (top notes, middle notes, base notes)
6. Jelaskan longevity dan sillage
7. Gunakan Bahasa Indonesia yang ramah dan profesional
8. Jangan buat klaim tentang kualitas premium vs standar
9. Jangan sebut kompetitor
10. Jika customer tertarik dengan satu produk, akhiri responsmu dengan: [[RECOMMEND:product_uuid]]
11. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi`,

    fashion: `Kamu adalah fashion advisor untuk {brand_name}.

Tentang brand:
{description}

Produk tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan style preference (casual, formal, sporty, elegant, minimalist)
2. Tanyakan ukuran yang dicari
3. Tanyakan warna atau material preference jika ada
4. Rekomendasikan maksimal 2 produk yang paling sesuai
5. Jelaskan fit, material, dan styling tips
6. Gunakan Bahasa Indonesia yang ramah dan profesional
7. Jangan sebut kompetitor
8. Jika customer tertarik dengan satu produk, akhiri responsmu dengan: [[RECOMMEND:product_uuid]]
9. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi`,

    fdb: `Kamu adalah food advisor untuk {brand_name}.

Tentang brand:
{description}

Produk tersedia:
{products_json}

Panduan rekomendasi:
1. Tanyakan preferensi rasa atau jenis makanan
2. Tanyakan dietary preference (vegetarian, vegan, gluten-free, dll)
3. Tanyakan occasion atau meal type (breakfast, snack, dinner, dll)
4. Rekomendasikan maksimal 2 produk yang paling sesuai
5. Jelaskan ingredients dan nutritional benefits
6. Jelaskan preparation atau serving suggestions
7. Gunakan Bahasa Indonesia yang ramah dan profesional
8. Jangan sebut kompetitor
9. Jika customer tertarik dengan satu produk, akhiri responsmu dengan: [[RECOMMEND:product_uuid]]
10. Jika tidak ada produk yang cocok, sarankan WhatsApp untuk konsultasi`,
  }

  const template = categoryPrompts[category.toLowerCase()] || categoryPrompts.skincare
  return template
    .replace('{brand_name}', brandName)
    .replace('{description}', description)
    .replace('{products_json}', productsJson)
}

/**
 * Call Ollama native /api/chat endpoint for streaming with think: false
 * Bypasses AI SDK to avoid thinking mode issues with Gemma
 */
async function callOllamaNativeChat(
  messages: Array<{ role: string; content: string }>,
  model: string
): Promise<AsyncIterable<string>> {
  const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434'
  const baseUrl = ollamaUrl.replace('/v1', '') // Remove /v1 suffix if present

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      options: {
        think: false, // CRITICAL: Disable thinking mode to get content output
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status} ${response.statusText}`)
  }

  const reader = response.body!.getReader()
  const decoder = new TextDecoder()

  return {
    async *[Symbol.asyncIterator]() {
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          // Ollama returns NDJSON, each line is a JSON object
          const lines = chunk.split('\n').filter((line) => line.trim())

          for (const line of lines) {
            if (!line.trim()) continue
            try {
              const json = JSON.parse(line)
              if (json.message?.content) {
                yield json.message.content
              }
            } catch (e) {
              // Skip parsing errors on individual lines
              console.warn('[Chat] Failed to parse JSON line:', line)
            }
          }
        }
      } finally {
        reader.releaseLock()
      }
    },
  }
}

/**
 * Call Claude API via AI SDK for production
 */
async function callClaudeChat(
  messages: Array<{ role: string; content: string }>,
  model: string
): Promise<AsyncIterable<string>> {
  // Dynamic import to avoid issues if @anthropic-ai/sdk not installed
  let Anthropic: any
  try {
    // @ts-ignore - Dynamic import not resolvable at compile time
    const module = await import('@anthropic-ai/sdk')
    Anthropic = module.default || module.Anthropic
  } catch (error) {
    throw new Error('Anthropic SDK not installed. Install with: npm install @anthropic-ai/sdk')
  }

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })

  // Convert to Claude message format (no system role)
  const systemMessage = messages.find((m) => m.role === 'system')?.content || ''
  const otherMessages = messages.filter((m) => m.role !== 'system')

  return {
    async *[Symbol.asyncIterator]() {
      const stream = await client.messages.stream({
        model,
        max_tokens: 1024,
        system: systemMessage,
        messages: otherMessages as any,
      })

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          yield event.delta.text
        }
      }
    },
  }
}

/**
 * Async function to log chat session to Supabase
 * Does NOT block the response
 */
async function logChatSessionAsync(
  tenantId: string,
  messages: Array<{ role: string; content: string }>,
  fullResponse: string,
  recommendations: string[]
): Promise<void> {
  try {
    const client = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || ''
    )

    // Build session record
    const sessionData = {
      tenant_id: tenantId,
      messages: messages,
      full_response: fullResponse,
      recommended_products: recommendations,
      user_message_count: messages.filter((m) => m.role === 'user').length,
    }

    const { error } = await client.from('chat_sessions').insert([sessionData])

    if (error) {
      console.error('[Chat Session Logging] Error:', error)
    } else {
      console.log('[Chat Session Logging] Successfully logged session')
    }
  } catch (error) {
    // Don't throw - just log the error
    console.error('[Chat Session Logging] Unexpected error:', error)
  }
}

/**
 * POST /api/chat/:tenant_slug
 * Stream AI product recommendations and chatbot responses
 *
 * Request body: { messages: [{role: 'user'|'assistant', content: string}] }
 * Response: Server-Sent Events (SSE) with streaming content and recommendations
 */
router.post('/:tenant_slug', async (req: Request, res: Response) => {
  const sessionId = `${req.params.tenant_slug}:${Date.now()}`

  try {
    const { tenant_slug } = req.params
    const { messages } = req.body as ChatRequest

    // Validate request
    if (!tenant_slug) {
      res.status(400).json({ error: 'tenant_slug is required' })
      return
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'messages array is required' })
      return
    }

    // Validate message format
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        res.status(400).json({ error: 'Each message must have role and content' })
        return
      }
      if (!['user', 'assistant'].includes(msg.role)) {
        res.status(400).json({ error: 'Message role must be "user" or "assistant"' })
        return
      }
    }

    // Check rate limiting
    if (!checkRateLimit(sessionId)) {
      res.status(429).json({ error: 'Rate limit exceeded: max 10 messages per minute' })
      return
    }

    // Load tenant config
    const config = await getTenantConfig(tenant_slug)
    if (!config) {
      res.status(404).json({ error: 'Tenant not found' })
      return
    }

    // Load products for this tenant
    const products = await getProducts(config.id)

    // Build products JSON for system prompt
    const productsJson = JSON.stringify(
      products.map((p) => {
        const product: Record<string, unknown> = {
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
        }

        // Add category-specific data
        if (config.category === 'skincare' && p.skincare_data) {
          product.skincare_data = p.skincare_data
        } else if (config.category === 'parfum' && p.parfum_data) {
          product.parfum_data = p.parfum_data
        } else if (config.category === 'fashion' && p.fashion_data) {
          product.fashion_data = p.fashion_data
        } else if (config.category === 'fdb' && p.fdb_data) {
          product.fdb_data = p.fdb_data
        }

        return product
      }),
      null,
      2
    )

    // Build category-specific system prompt
    const systemPrompt = buildSystemPrompt(
      config.category,
      config.brand_name,
      config.description || '',
      config.chatbot_name,
      config.chatbot_persona || '',
      productsJson
    )

    // Prepare messages with system prompt
    const allMessages = [{ role: 'system', content: systemPrompt }, ...messages]

    // Set SSE response headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Determine AI provider
    const provider = process.env.AI_PROVIDER || 'ollama'
    const modelName = provider === 'ollama'
      ? process.env.OLLAMA_MODEL || 'gemma4:12b'
      : process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6'

    console.log(`[Chat] Using provider: ${provider}, model: ${modelName}`)

    // Get appropriate chat stream
    let chatStream: AsyncIterable<string>
    if (provider === 'ollama') {
      chatStream = await callOllamaNativeChat(allMessages, modelName)
    } else {
      chatStream = await callClaudeChat(allMessages, modelName)
    }

    // Stream response
    let fullResponse = ''
    for await (const chunk of chatStream) {
      if (chunk) {
        fullResponse += chunk
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
      }
    }

    // Parse recommendations from response
    const recommendations = parseRecommendations(fullResponse)

    // Send completion event with recommendations
    res.write(
      `data: ${JSON.stringify({
        type: 'complete',
        recommendations,
      })}\n\n`
    )

    // Log chat session asynchronously (don't block response)
    logChatSessionAsync(config.id, messages, fullResponse, recommendations).catch((error) => {
      console.error('[Chat] Failed to log session:', error)
    })

    res.end()
  } catch (error) {
    console.error('[Chat Error]', error)

    // Only send error if headers haven't been sent
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Chat request failed',
        message:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : 'An error occurred processing your request',
      })
    } else {
      // Headers already sent, close the connection
      res.end()
    }
  }
})

export default router
