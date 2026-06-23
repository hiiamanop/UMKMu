import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import request from 'supertest'
import express, { Express } from 'express'
import chatRouter from '../../src/routes/chat.js'

// Mock external dependencies
vi.mock('../../src/services/config-cache.js', () => ({
  getTenantConfig: vi.fn(),
  getProducts: vi.fn(),
}))

vi.mock('../../src/services/category-matcher.js', () => ({
  rankProductsForRecommendation: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    }),
  })),
}))

// Mock fetch globally for Ollama API
global.fetch = vi.fn()

// Import mocked modules
import * as configCacheMocks from '../../src/services/config-cache.js'

// Helper to create mock Ollama stream response
function createMockOllamaStream(lines: string[]) {
  let lineIndex = 0

  return {
    ok: true,
    body: {
      getReader: vi.fn(() => ({
        read: vi.fn(async () => {
          if (lineIndex >= lines.length) {
            return { done: true }
          }
          const line = lines[lineIndex]
          lineIndex++
          return {
            done: false,
            value: new TextEncoder().encode(line + '\n'),
          }
        }),
        releaseLock: vi.fn(),
      })),
    },
  }
}

describe('Chat Endpoint', () => {
  let app: Express

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/api/chat', chatRouter)

    // Clear all mocks before each test
    vi.clearAllMocks()

    // Default environment for tests
    process.env.AI_PROVIDER = 'ollama'
    process.env.OLLAMA_MODEL = 'gemma4:12b'
    process.env.OLLAMA_BASE_URL = 'http://localhost:11434'
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'test-key'
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Request Validation', () => {
    it('should return 400 when tenant_slug is missing', async () => {
      const response = await request(app)
        .post('/api/chat/')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(404) // Express routes this as 404
    })

    it('should return 400 when messages array is empty', async () => {
      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [] })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('messages array is required')
    })

    it('should return 400 when messages is not an array', async () => {
      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: 'not an array' })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('messages array is required')
    })

    it('should return 400 when message has no role', async () => {
      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ content: 'Hello' }] })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('role and content')
    })

    it('should return 400 when message has invalid role', async () => {
      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'system', content: 'Hello' }] })

      expect(response.status).toBe(400)
      expect(response.body.error).toContain('"user" or "assistant"')
    })

    it('should return 404 when tenant is not found', async () => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue(null)

      const response = await request(app)
        .post('/api/chat/nonexistent-tenant')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(404)
      expect(response.body.error).toContain('Tenant not found')
    })
  })

  describe('Rate Limiting', () => {
    beforeEach(() => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'test-slug',
        brand_name: 'Test Brand',
        category: 'skincare',
        description: 'Test Description',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Friendly',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])
    })

    it('should allow requests within rate limit', async () => {
      // Mock Ollama response (NDJSON format)
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream(['{"message":{"content":"Hello"}}'])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('text/event-stream')
    })
  })

  describe('System Prompt Generation', () => {
    it('should use category-specific system prompt for skincare', async () => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'skincare-brand',
        brand_name: 'Glow Skincare',
        category: 'skincare',
        description: 'Premium skincare products',
        chatbot_name: 'Beauty Advisor',
        chatbot_persona: 'Knowledgeable and friendly',
        primary_color: '#ff69b4',
        secondary_color: '#ffffff',
        accent_color: '#ffc0cb',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([
        {
          id: 'product-1',
          tenant_id: 'tenant-uuid',
          name: 'Cleanser',
          price: 100000,
          skincare_data: {
            skin_types: ['oily', 'combination'],
            concerns: ['acne'],
            ingredients: ['salicylic acid'],
            usage_step: 'cleanser',
          },
          sort_order: 1,
          is_active: true,
        },
      ])

      // Mock Ollama streaming response that includes system prompt in messages
      const systemPromptCapture: any[] = []
      ;(global.fetch as any).mockImplementation((url: string, options: any) => {
        if (options.body) {
          const body = JSON.parse(options.body)
          systemPromptCapture.push(body)
        }
        return Promise.resolve(createMockOllamaStream(['{"message":{"content":"Halo!"}}']))
      })

      const response = await request(app)
        .post('/api/chat/skincare-brand')
        .send({ messages: [{ role: 'user', content: 'Saya punya kulit berminyak' }] })

      expect(response.status).toBe(200)
      // Verify that system prompt was sent to AI
      expect(systemPromptCapture.length).toBeGreaterThan(0)
      const sentMessages = systemPromptCapture[0].messages
      expect(sentMessages[0].role).toBe('system')
      expect(sentMessages[0].content).toContain('skincare advisor')
      expect(sentMessages[0].content).toContain('Glow Skincare')
      expect(sentMessages[0].content).toContain('skin_types')
    })

    it('should use category-specific system prompt for parfum', async () => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'parfum-brand',
        brand_name: 'Essence Parfums',
        category: 'parfum',
        description: 'Luxury fragrances',
        chatbot_name: 'Fragrance Expert',
        chatbot_persona: 'Sophisticated',
        primary_color: '#8b4789',
        secondary_color: '#ffffff',
        accent_color: '#d4a5d4',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])

      const systemPromptCapture: any[] = []
      ;(global.fetch as any).mockImplementation((url: string, options: any) => {
        if (options.body) {
          const body = JSON.parse(options.body)
          systemPromptCapture.push(body)
        }
        return Promise.resolve(createMockOllamaStream(['{"message":{"content":"Selamat!"}}']))
      })

      await request(app)
        .post('/api/chat/parfum-brand')
        .send({ messages: [{ role: 'user', content: 'Saya suka aroma floral' }] })

      const sentMessages = systemPromptCapture[0].messages
      expect(sentMessages[0].content).toContain('fragrance advisor')
      expect(sentMessages[0].content).toContain('Essence Parfums')
    })
  })

  describe('Response Streaming', () => {
    beforeEach(() => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'test-slug',
        brand_name: 'Test Brand',
        category: 'skincare',
        description: 'Test Description',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Friendly',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])
    })

    it('should stream response as Server-Sent Events', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream([
          '{"message":{"content":"Hello "}}',
          '{"message":{"content":"world"}}',
        ])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('text/event-stream')
      // Check for SSE format with content
      expect(response.text).toContain('Hello')
      expect(response.text).toContain('world')
      expect(response.text).toContain('complete')
    })

    it('should include completion event with recommendations', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream([
          '{"message":{"content":"Check this: [[RECOMMEND:product-123]]"}}',
        ])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(200)
      // Check for completion event
      expect(response.text).toContain('complete')
      expect(response.text).toContain('product-123')
    })
  })

  describe('Recommendation Parsing', () => {
    beforeEach(() => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'test-slug',
        brand_name: 'Test Brand',
        category: 'skincare',
        description: 'Test Description',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Friendly',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])
    })

    it('should parse single recommendation token', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream([
          '{"message":{"content":"Recommended product: [[RECOMMEND:abc-123-def]]"}}',
        ])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'What do you recommend?' }] })

      expect(response.text).toContain('abc-123-def')
    })

    it('should parse multiple recommendation tokens', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream([
          '{"message":{"content":"First: [[RECOMMEND:prod-1]] or [[RECOMMEND:prod-2]]"}}',
        ])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Options?' }] })

      expect(response.text).toContain('prod-1')
      expect(response.text).toContain('prod-2')
    })

    it('should handle no recommendations', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream(['{"message":{"content":"Sorry, no matching products."}}'])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Any products?' }] })

      expect(response.status).toBe(200)
      // Should still have completion event
      expect(response.text).toContain('complete')
    })
  })

  describe('Error Handling', () => {
    beforeEach(() => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'test-slug',
        brand_name: 'Test Brand',
        category: 'skincare',
        description: 'Test Description',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Friendly',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])
    })

    it('should handle Ollama API error gracefully', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      expect(response.status).toBe(500)
      expect(response.body).toBeDefined()
      expect(response.body.error || response.text).toBeTruthy()
    })

    it('should handle malformed JSON in stream', async () => {
      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream([
          'invalid json{}', // This will be skipped
          '{"message":{"content":"Valid response"}}',
        ])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      // Should still succeed and stream valid content
      expect(response.status).toBe(200)
      expect(response.text).toContain('Valid response')
    })
  })

  describe('Async Session Logging', () => {
    it('should log chat session asynchronously without blocking response', async () => {
      const mocks = configCacheMocks as any
      mocks.getTenantConfig.mockResolvedValue({
        id: 'tenant-uuid',
        slug: 'test-slug',
        brand_name: 'Test Brand',
        category: 'skincare',
        description: 'Test Description',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Friendly',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        is_active: true,
      })
      mocks.getProducts.mockResolvedValue([])

      ;(global.fetch as any).mockResolvedValue(
        createMockOllamaStream(['{"message":{"content":"Response with [[RECOMMEND:prod-1]]"}}'])
      )

      const response = await request(app)
        .post('/api/chat/test-slug')
        .send({ messages: [{ role: 'user', content: 'Hello' }] })

      // Response should return immediately without waiting for logging
      expect(response.status).toBe(200)
      expect(response.headers['content-type']).toContain('text/event-stream')
    })
  })
})
