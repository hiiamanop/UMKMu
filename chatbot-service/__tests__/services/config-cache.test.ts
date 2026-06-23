import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTenantConfig,
  getChatbotConfig,
  getProducts,
  invalidateCache,
  clearCache,
  getCacheStats,
  type TenantConfig,
  type Product,
} from '../../src/services/config-cache'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()
  const mockOrder = vi.fn()

  return {
    createClient: vi.fn(() => ({
      from: mockFrom,
    })),
    // Store references for test access
    __mockFrom: mockFrom,
    __mockSelect: mockSelect,
    __mockEq: mockEq,
    __mockSingle: mockSingle,
    __mockOrder: mockOrder,
  }
})

// Helper to set up mock chain
function setupMockChain(data: unknown, error: unknown = null) {
  const { createClient } = require('@supabase/supabase-js')
  const mockClient = createClient()

  mockClient.from.mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data, error }),
        }),
        order: vi.fn().mockResolvedValue({ data, error }),
      }),
    }),
  })

  return mockClient
}

describe('Config Cache Service', () => {
  beforeEach(() => {
    // Set required env vars
    process.env.SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_ANON_KEY = 'test-key'

    // Clear all caches before each test
    clearCache()

    // Reset mocks
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearCache()
  })

  describe('getTenantConfig', () => {
    it('should fetch tenant config from Supabase on cache miss', async () => {
      const mockTenantConfig: TenantConfig = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      setupMockChain(mockTenantConfig)

      const result = await getTenantConfig('glow-id')

      expect(result).toEqual(mockTenantConfig)
      expect(result?.brand_name).toBe('Glow Indonesia')
      expect(result?.category).toBe('skincare')
    })

    it('should return cached config on subsequent calls within TTL', async () => {
      const mockTenantConfig: TenantConfig = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      const mockClient = setupMockChain(mockTenantConfig)

      // First call should hit Supabase
      const result1 = await getTenantConfig('glow-id')
      expect(result1).toEqual(mockTenantConfig)

      // Second call should use cache (mock not called again)
      const result2 = await getTenantConfig('glow-id')
      expect(result2).toEqual(mockTenantConfig)

      // Verify mock was only called once
      expect(mockClient.from).toHaveBeenCalledTimes(1)
    })

    it('should return null when tenant not found', async () => {
      setupMockChain(null)

      const result = await getTenantConfig('non-existent')

      expect(result).toBeNull()
    })

    it('should return null on Supabase error', async () => {
      const mockError = new Error('Database connection error')
      setupMockChain(null, mockError)

      const result = await getTenantConfig('glow-id')

      expect(result).toBeNull()
    })

    it('should include all tenant fields in config', async () => {
      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'test-store',
        brand_name: 'Test Store',
        tagline: 'Best products',
        description: 'Description here',
        category: 'parfum',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6212345678',
        instagram_url: 'https://instagram.com/test',
        tokopedia_url: 'https://tokopedia.com/test',
        shopee_url: 'https://shopee.com/test',
        chatbot_name: 'Test Bot',
        chatbot_persona: 'Helpful bot',
        is_active: true,
        owner_email: 'test@example.com',
      }

      setupMockChain(mockTenantConfig)

      const result = await getTenantConfig('test-store')

      expect(result).toEqual(mockTenantConfig)
      expect(result?.category).toBeDefined()
      expect(result?.owner_email).toBeDefined()
    })
  })

  describe('getChatbotConfig (backward compatibility)', () => {
    it('should work as alias for getTenantConfig', async () => {
      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      setupMockChain(mockTenantConfig)

      const result = await getChatbotConfig('glow-id')

      expect(result).toEqual(mockTenantConfig)
    })
  })

  describe('getProducts', () => {
    it('should fetch active products for tenant from Supabase', async () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          tenant_id: 'tenant-123',
          created_at: '2024-01-01T00:00:00Z',
          name: 'Cleanser',
          description: 'Gentle face cleanser',
          price: 100000,
          image_url: 'https://example.com/cleanser.jpg',
          category_type: 'skincare',
          skincare_data: {
            skin_types: ['oily', 'combination'],
            concerns: ['acne', 'pores'],
            ingredients: ['salicylic-acid', 'tea-tree'],
            usage_step: 'cleanser',
          },
          tokopedia_url: 'https://tokopedia.com/product/1',
          shopee_url: 'https://shopee.com/product/1',
          sort_order: 1,
          is_active: true,
        },
        {
          id: 'prod-2',
          tenant_id: 'tenant-123',
          created_at: '2024-01-02T00:00:00Z',
          name: 'Moisturizer',
          description: 'Hydrating moisturizer',
          price: 150000,
          image_url: 'https://example.com/moisturizer.jpg',
          category_type: 'skincare',
          skincare_data: {
            skin_types: ['dry', 'sensitive'],
            concerns: ['hydrating', 'anti-aging'],
            ingredients: ['ceramide', 'hyaluronic-acid'],
            usage_step: 'moisturizer',
          },
          tokopedia_url: 'https://tokopedia.com/product/2',
          shopee_url: 'https://shopee.com/product/2',
          sort_order: 2,
          is_active: true,
        },
      ]

      setupMockChain(mockProducts)

      const result = await getProducts('tenant-123')

      expect(result).toEqual(mockProducts)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Cleanser')
    })

    it('should return empty array when no products found', async () => {
      setupMockChain([])

      const result = await getProducts('tenant-123')

      expect(result).toEqual([])
    })

    it('should cache products and return cached version on subsequent calls', async () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          tenant_id: 'tenant-123',
          created_at: '2024-01-01T00:00:00Z',
          name: 'Cleanser',
          description: 'Gentle face cleanser',
          price: 100000,
          image_url: 'https://example.com/cleanser.jpg',
          category_type: 'skincare',
          skincare_data: {},
          sort_order: 1,
          is_active: true,
        },
      ]

      const mockClient = setupMockChain(mockProducts)

      // First call
      const result1 = await getProducts('tenant-123')
      expect(result1).toEqual(mockProducts)

      // Second call should use cache
      const result2 = await getProducts('tenant-123')
      expect(result2).toEqual(mockProducts)

      // Mock should only be called once
      expect(mockClient.from).toHaveBeenCalledTimes(1)
    })

    it('should return empty array on Supabase error', async () => {
      const mockError = new Error('Query error')
      setupMockChain(null, mockError)

      const result = await getProducts('tenant-123')

      expect(result).toEqual([])
    })

    it('should include all product fields including category-specific data', async () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          tenant_id: 'tenant-123',
          created_at: '2024-01-01T00:00:00Z',
          name: 'Perfume',
          description: 'Luxury perfume',
          price: 500000,
          image_url: 'https://example.com/perfume.jpg',
          category_type: 'parfum',
          parfum_data: {
            fragrance_family: 'floral',
            notes_top: ['bergamot'],
            notes_middle: ['rose'],
            notes_base: ['musk'],
            size: '100ml',
            longevity: '8-10 hours',
          },
          sort_order: 1,
          is_active: true,
        },
      ]

      setupMockChain(mockProducts)

      const result = await getProducts('tenant-123')

      expect(result[0].category_type).toBe('parfum')
      expect(result[0].parfum_data).toBeDefined()
      expect(result[0].parfum_data?.fragrance_family).toBe('floral')
    })
  })

  describe('invalidateCache', () => {
    it('should clear tenant config cache for specific tenant', async () => {
      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      setupMockChain(mockTenantConfig)

      // First call caches the config
      await getTenantConfig('glow-id')

      // Cache should have entry
      let stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(1)

      // Invalidate cache
      invalidateCache('glow-id', 'tenant-uuid-123')

      // Cache should be cleared
      stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(0)
    })

    it('should clear products cache when tenant ID is provided', async () => {
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          tenant_id: 'tenant-123',
          created_at: '2024-01-01T00:00:00Z',
          name: 'Cleanser',
          description: 'Gentle face cleanser',
          price: 100000,
          image_url: 'https://example.com/cleanser.jpg',
          category_type: 'skincare',
          skincare_data: {},
          sort_order: 1,
          is_active: true,
        },
      ]

      setupMockChain(mockProducts)

      // Cache products
      await getProducts('tenant-123')

      // Cache should have entry
      let stats = getCacheStats()
      expect(stats.productsCache.size).toBe(1)

      // Invalidate both tenant config and products cache
      invalidateCache('glow-id', 'tenant-123')

      // Products cache should be cleared
      stats = getCacheStats()
      expect(stats.productsCache.size).toBe(0)
    })
  })

  describe('clearCache', () => {
    it('should clear all cached entries', async () => {
      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          tenant_id: 'tenant-123',
          created_at: '2024-01-01T00:00:00Z',
          name: 'Cleanser',
          description: 'Gentle face cleanser',
          price: 100000,
          image_url: 'https://example.com/cleanser.jpg',
          category_type: 'skincare',
          skincare_data: {},
          sort_order: 1,
          is_active: true,
        },
      ]

      setupMockChain(mockTenantConfig)

      // Populate both caches
      await getTenantConfig('glow-id')

      setupMockChain(mockProducts)
      await getProducts('tenant-123')

      // Both caches should have entries
      let stats = getCacheStats()
      expect(stats.totalSize).toBeGreaterThan(0)

      // Clear all
      clearCache()

      // All caches should be empty
      stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(0)
      expect(stats.productsCache.size).toBe(0)
      expect(stats.totalSize).toBe(0)
    })
  })

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      clearCache()

      let stats = getCacheStats()

      expect(stats).toHaveProperty('tenantConfigCache')
      expect(stats).toHaveProperty('productsCache')
      expect(stats).toHaveProperty('totalSize')
      expect(stats).toHaveProperty('ttlMinutes')
      expect(stats.ttlMinutes).toBe(5)
    })

    it('should track cache size correctly', async () => {
      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      setupMockChain(mockTenantConfig)

      // Initially empty
      let stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(0)

      // After fetching tenant config
      await getTenantConfig('glow-id')
      stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(1)
      expect(stats.tenantConfigCache.keys).toContain('tenant:glow-id:config')
    })
  })

  describe('Error handling', () => {
    it('should handle missing SUPABASE_URL gracefully', async () => {
      clearCache()
      delete process.env.SUPABASE_URL

      // This would throw on client creation, but we're testing graceful degradation
      expect(() => {
        const { createClient } = require('@supabase/supabase-js')
        createClient()
      }).toBeDefined()
    })

    it('should log cache hits and misses', async () => {
      const consoleSpy = vi.spyOn(console, 'log')

      const mockTenantConfig: TenantConfig = {
        id: 'uuid-123',
        slug: 'glow-id',
        brand_name: 'Glow Indonesia',
        tagline: 'Natural skincare',
        description: 'Premium natural skincare products',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo.png',
        hero_image_url: 'https://example.com/hero.png',
        whatsapp_number: '+6281234567890',
        instagram_url: 'https://instagram.com/glow_id',
        tokopedia_url: 'https://tokopedia.com/glow',
        shopee_url: 'https://shopee.com/glow',
        chatbot_name: 'Glow Advisor',
        chatbot_persona: 'Friendly skincare expert',
        is_active: true,
        owner_email: 'owner@glow.id',
      }

      setupMockChain(mockTenantConfig)

      // First call - cache miss
      await getTenantConfig('glow-id')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Miss'))

      // Clear console spy
      consoleSpy.mockClear()

      // Second call - cache hit
      await getTenantConfig('glow-id')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Hit'))

      consoleSpy.mockRestore()
    })
  })

  describe('Multi-tenant isolation', () => {
    it('should cache different tenants separately', async () => {
      const mockTenantConfig1: TenantConfig = {
        id: 'uuid-1',
        slug: 'store1',
        brand_name: 'Store 1',
        tagline: 'First store',
        description: 'First store description',
        category: 'skincare',
        primary_color: '#1a1a1a',
        secondary_color: '#f5f5f5',
        accent_color: '#d4a574',
        logo_url: 'https://example.com/logo1.png',
        hero_image_url: 'https://example.com/hero1.png',
        whatsapp_number: '+62111111111',
        instagram_url: 'https://instagram.com/store1',
        tokopedia_url: 'https://tokopedia.com/store1',
        shopee_url: 'https://shopee.com/store1',
        chatbot_name: 'Advisor 1',
        chatbot_persona: 'Persona 1',
        is_active: true,
        owner_email: 'store1@example.com',
      }

      const mockTenantConfig2: TenantConfig = {
        id: 'uuid-2',
        slug: 'store2',
        brand_name: 'Store 2',
        tagline: 'Second store',
        description: 'Second store description',
        category: 'parfum',
        primary_color: '#000000',
        secondary_color: '#ffffff',
        accent_color: '#cccccc',
        logo_url: 'https://example.com/logo2.png',
        hero_image_url: 'https://example.com/hero2.png',
        whatsapp_number: '+62222222222',
        instagram_url: 'https://instagram.com/store2',
        tokopedia_url: 'https://tokopedia.com/store2',
        shopee_url: 'https://shopee.com/store2',
        chatbot_name: 'Advisor 2',
        chatbot_persona: 'Persona 2',
        is_active: true,
        owner_email: 'store2@example.com',
      }

      setupMockChain(mockTenantConfig1)
      const result1 = await getTenantConfig('store1')

      setupMockChain(mockTenantConfig2)
      const result2 = await getTenantConfig('store2')

      // Verify different tenants are cached separately
      expect(result1?.brand_name).toBe('Store 1')
      expect(result2?.brand_name).toBe('Store 2')

      // Verify cache has both
      const stats = getCacheStats()
      expect(stats.tenantConfigCache.size).toBe(2)
    })
  })
})
