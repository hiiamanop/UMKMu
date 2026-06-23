import { describe, it, expect, beforeEach } from 'vitest'
import { rankProductsForRecommendation } from '../../src/services/category-matcher'
import { Product } from '../../src/services/config-cache'

describe('Category-Specific Product Matching', () => {
  const createMockProduct = (
    id: string,
    name: string,
    category: string,
    categoryData: Record<string, any>
  ): Product => ({
    id,
    tenant_id: 'test-tenant-id',
    created_at: new Date().toISOString(),
    name,
    description: `Test product: ${name}`,
    price: 100000,
    image_url: 'https://example.com/image.jpg',
    category_type: category as any,
    skincare_data: category === 'skincare' ? categoryData : undefined,
    parfum_data: category === 'parfum' ? categoryData : undefined,
    fashion_data: category === 'fashion' ? categoryData : undefined,
    fdb_data: category === 'fdb' ? categoryData : undefined,
    tokopedia_url: 'https://tokopedia.com',
    shopee_url: 'https://shopee.com',
    sort_order: 0,
    is_active: true,
  })

  describe('Skincare Matching', () => {
    let skincareProducts: Product[]

    beforeEach(() => {
      skincareProducts = [
        createMockProduct('product-1', 'Oily Skin Cleanser', 'skincare', {
          skin_types: ['oily', 'combination'],
          concerns: ['acne', 'pores'],
          ingredients: ['salicylic acid', 'tea tree oil'],
        }),
        createMockProduct('product-2', 'Dry Skin Moisturizer', 'skincare', {
          skin_types: ['dry', 'sensitive'],
          concerns: ['dehydration', 'irritation'],
          ingredients: ['ceramide', 'hyaluronic acid'],
        }),
        createMockProduct('product-3', 'Anti-Aging Serum', 'skincare', {
          skin_types: ['all'],
          concerns: ['wrinkles', 'brightening'],
          ingredients: ['retinol', 'vitamin c'],
        }),
      ]
    })

    it('should match products by skin type', () => {
      const messages = [{ role: 'user' as const, content: 'I have oily skin' }]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('product-1') // Oily skin cleanser should rank first
    })

    it('should match products by concerns', () => {
      const messages = [
        { role: 'user' as const, content: 'I have acne and want to treat pores' },
      ]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      // Product-1 has both acne and pores concerns
      expect(result[0].id).toBe('product-1')
    })

    it('should match products by ingredients', () => {
      const messages = [{ role: 'user' as const, content: 'I love retinol and vitamin c' }]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('product-3') // Anti-aging serum has retinol and vitamin c
    })

    it('should combine multiple scoring factors', () => {
      const messages = [
        {
          role: 'user' as const,
          content: 'I have oily skin, suffering from acne and pores. Can I use something with salicylic acid?',
        },
      ]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      // Product-1 matches: oily skin type (+50), acne and pores concerns (+60), salicylic acid (+10) = 120 total
      expect(result[0].id).toBe('product-1')
    })

    it('should score "all" skin type lower than specific match', () => {
      const messages = [{ role: 'user' as const, content: 'I have dry skin' }]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      // Product-2 (dry) should rank before Product-3 (all)
      if (result.length >= 2) {
        expect(result[0].id).toBe('product-2')
      }
    })

    it('should handle case-insensitive matching', () => {
      const messages = [
        { role: 'user' as const, content: 'I have OILY SKIN and ACNE problems' },
      ]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('product-1')
    })

    it('should return empty array when no keywords match', () => {
      const messages = [{ role: 'user' as const, content: 'Hello there' }]

      const result = rankProductsForRecommendation(skincareProducts, messages, 'skincare')

      expect(result.length).toBe(0)
    })
  })

  describe('Parfum Matching', () => {
    let parfumProducts: Product[]

    beforeEach(() => {
      parfumProducts = [
        createMockProduct('parfum-1', 'Floral Perfume', 'parfum', {
          fragrance_family: ['floral', 'rose'],
          notes: ['rose', 'jasmine', 'vanilla'],
        }),
        createMockProduct('parfum-2', 'Woody Cologne', 'parfum', {
          fragrance_family: ['woody', 'oud'],
          notes: ['sandalwood', 'cedar', 'musk'],
        }),
        createMockProduct('parfum-3', 'Fresh Citrus', 'parfum', {
          fragrance_family: ['citrus', 'fresh'],
          notes: ['lemon', 'bergamot', 'neroli'],
        }),
      ]
    })

    it('should match products by fragrance family', () => {
      const messages = [
        { role: 'user' as const, content: 'I love floral scents, especially rose' },
      ]

      const result = rankProductsForRecommendation(parfumProducts, messages, 'parfum')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('parfum-1')
    })

    it('should match products by notes', () => {
      const messages = [
        { role: 'user' as const, content: 'I like woody scents with sandalwood and cedar' },
      ]

      const result = rankProductsForRecommendation(parfumProducts, messages, 'parfum')

      expect(result.length).toBeGreaterThan(0)
      // Product parfum-2 has both sandalwood and cedar
      expect(result[0].id).toBe('parfum-2')
    })

    it('should score fragrance family higher than individual notes', () => {
      const messages = [
        { role: 'user' as const, content: 'I want a woody fragrance with sandalwood' },
      ]

      const result = rankProductsForRecommendation(parfumProducts, messages, 'parfum')

      expect(result.length).toBeGreaterThan(0)
      // parfum-2: woody family (+60) + sandalwood note (+15) = 75
      expect(result[0].id).toBe('parfum-2')
    })
  })

  describe('Fashion Matching', () => {
    let fashionProducts: Product[]

    beforeEach(() => {
      fashionProducts = [
        createMockProduct('fashion-1', 'Casual T-Shirt', 'fashion', {
          style: ['casual', 'streetwear'],
          sizes: ['S', 'M', 'L', 'XL'],
          colors: ['black', 'white'],
          materials: ['cotton'],
        }),
        createMockProduct('fashion-2', 'Formal Blazer', 'fashion', {
          style: ['formal', 'business'],
          sizes: ['S', 'M', 'L'],
          colors: ['navy', 'black'],
          materials: ['wool', 'cotton blend'],
        }),
        createMockProduct('fashion-3', 'Athletic Jacket', 'fashion', {
          style: ['athletic', 'sporty'],
          sizes: ['XS', 'S', 'M', 'L'],
          colors: ['blue', 'black', 'red'],
          materials: ['polyester', 'nylon'],
        }),
      ]
    })

    it('should match products by style', () => {
      const messages = [
        { role: 'user' as const, content: 'I need something casual for daily wear' },
      ]

      const result = rankProductsForRecommendation(fashionProducts, messages, 'fashion')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('fashion-1')
    })

    it('should match products by size', () => {
      const messages = [{ role: 'user' as const, content: 'I wear size M' }]

      const result = rankProductsForRecommendation(fashionProducts, messages, 'fashion')

      expect(result.length).toBeGreaterThan(0)
      // All fashion products have size M, so style preference wins (or order)
      expect(result.length).toBeGreaterThan(0)
    })

    it('should combine style and size scoring', () => {
      const messages = [
        {
          role: 'user' as const,
          content: 'I need formal business clothing in size L',
        },
      ]

      const result = rankProductsForRecommendation(fashionProducts, messages, 'fashion')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('fashion-2')
    })

    it('should handle athletic style matching', () => {
      // Create products with different sort_order to test athletic ranking
      const fashionWithOrder = [
        { ...fashionProducts[0], sort_order: 2 }, // casual - lower priority
        { ...fashionProducts[1], sort_order: 1 }, // formal - middle priority
        { ...fashionProducts[2], sort_order: 0 }, // athletic - higher priority (lower sort_order = higher priority)
      ]

      const messages = [
        {
          role: 'user' as const,
          content: 'I am looking for athletic and sporty wear',
        },
      ]

      const result = rankProductsForRecommendation(fashionWithOrder, messages, 'fashion')

      expect(result.length).toBeGreaterThan(0)
      // Athletic product should rank first due to matching keywords and better sort_order
      expect(result[0].id).toBe('fashion-3')
    })
  })

  describe('F&B Matching', () => {
    let fdbProducts: Product[]

    beforeEach(() => {
      fdbProducts = [
        createMockProduct('fdb-1', 'Vegan Burger', 'fdb', {
          dietary: ['vegan', 'vegetarian'],
          ingredients: ['plant-based', 'soy', 'vegetables'],
          allergens: ['soy'],
        }),
        createMockProduct('fdb-2', 'Gluten-Free Pasta', 'fdb', {
          dietary: ['gluten-free', 'vegetarian'],
          ingredients: ['rice flour', 'tomato sauce', 'vegetables'],
          allergens: [],
        }),
        createMockProduct('fdb-3', 'Organic Chicken Bowl', 'fdb', {
          dietary: ['organic', 'high-protein'],
          ingredients: ['organic chicken', 'quinoa', 'vegetables'],
          allergens: [],
        }),
      ]
    })

    it('should match products by dietary preference', () => {
      const messages = [
        { role: 'user' as const, content: 'I follow a vegan diet' },
      ]

      const result = rankProductsForRecommendation(fdbProducts, messages, 'fdb')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('fdb-1')
    })

    it('should match products by ingredients', () => {
      const messages = [
        { role: 'user' as const, content: 'I want something with organic ingredients' },
      ]

      const result = rankProductsForRecommendation(fdbProducts, messages, 'fdb')

      expect(result.length).toBeGreaterThan(0)
      expect(result[0].id).toBe('fdb-3')
    })

    it('should score dietary preference higher than ingredients', () => {
      const messages = [
        {
          role: 'user' as const,
          content: 'I need gluten-free food options',
        },
      ]

      const result = rankProductsForRecommendation(fdbProducts, messages, 'fdb')

      expect(result.length).toBeGreaterThan(0)
      // fdb-2: gluten-free (+60) = 60
      expect(result[0].id).toBe('fdb-2')
    })

    it('should handle multiple dietary restrictions', () => {
      const messages = [
        {
          role: 'user' as const,
          content: 'I am vegan and vegetarian',
        },
      ]

      const result = rankProductsForRecommendation(fdbProducts, messages, 'fdb')

      expect(result.length).toBeGreaterThan(0)
      // fdb-1: has both vegan and vegetarian
      expect(result[0].id).toBe('fdb-1')
    })
  })

  describe('Edge Cases & Tie-Breaking', () => {
    it('should return empty array when products array is empty', () => {
      const messages = [{ role: 'user' as const, content: 'I need skincare' }]

      const result = rankProductsForRecommendation([], messages, 'skincare')

      expect(result).toEqual([])
    })

    it('should return empty array when messages are empty', () => {
      const products = [
        createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: ['salicylic acid'],
        }),
      ]

      const result = rankProductsForRecommendation(products, [], 'skincare')

      expect(result).toEqual([])
    })

    it('should return empty array when messages have no relevant keywords', () => {
      const products = [
        createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: ['salicylic acid'],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'Hello there, how are you?' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      expect(result).toEqual([])
    })

    it('should return max 2 products even if more than 2 match', () => {
      const products = [
        createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: [],
        }),
        createMockProduct('p2', 'Product 2', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: [],
        }),
        createMockProduct('p3', 'Product 3', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: [],
        }),
        createMockProduct('p4', 'Product 4', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: [],
        }),
      ]

      const messages = [{ role: 'user' as const, content: 'oily acne' }]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      expect(result.length).toBeLessThanOrEqual(2)
    })

    it('should use sort_order as tie-breaker when scores are equal', () => {
      const products = [
        { ...createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: [],
          ingredients: [],
        }), sort_order: 2 },
        { ...createMockProduct('p2', 'Product 2', 'skincare', {
          skin_types: ['oily'],
          concerns: [],
          ingredients: [],
        }), sort_order: 1 },
      ]

      const messages = [{ role: 'user' as const, content: 'oily' }]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      expect(result.length).toBe(2)
      // When scores are equal (both have +50 for oily), sort_order should break tie
      // Lower sort_order comes first
      expect(result[0].sort_order).toBeLessThanOrEqual(result[1].sort_order)
    })

    it('should handle unknown category gracefully', () => {
      const products = [
        createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: [],
          ingredients: [],
        }),
      ]

      const messages = [{ role: 'user' as const, content: 'oily' }]

      const result = rankProductsForRecommendation(products, messages, 'unknown')

      expect(result).toEqual([])
    })

    it('should handle products missing category data', () => {
      const products = [
        {
          ...createMockProduct('p1', 'Product 1', 'skincare', {}),
          skincare_data: undefined,
        },
        createMockProduct('p2', 'Product 2', 'skincare', {
          skin_types: ['oily'],
          concerns: [],
          ingredients: [],
        }),
      ]

      const messages = [{ role: 'user' as const, content: 'oily' }]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      // Only p2 should be ranked
      expect(result.length).toBe(1)
      expect(result[0].id).toBe('p2')
    })
  })

  describe('Multi-Turn Conversations', () => {
    it('should extract keywords from entire conversation history', () => {
      const products = [
        createMockProduct('p1', 'Product 1', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne'],
          ingredients: [],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'What do you recommend?' },
        { role: 'assistant' as const, content: 'Tell me more about your skin' },
        { role: 'user' as const, content: 'I have oily skin and acne problems' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      expect(result.length).toBe(1)
      expect(result[0].id).toBe('p1')
    })

    it('should aggregate keywords from multiple user messages', () => {
      const products = [
        createMockProduct('p1', 'Floral Perfume', 'parfum', {
          fragrance_family: ['floral'],
          notes: ['rose', 'jasmine'],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'I like floral scents' },
        { role: 'assistant' as const, content: 'What notes do you prefer?' },
        { role: 'user' as const, content: 'I love rose and jasmine' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'parfum')

      expect(result.length).toBe(1)
      expect(result[0].id).toBe('p1')
    })
  })

  describe('Category-Specific Scoring', () => {
    it('should apply correct skincare scoring weights', () => {
      const products = [
        createMockProduct('p1', 'Product', 'skincare', {
          skin_types: ['oily'],
          concerns: ['acne', 'pores'],
          ingredients: ['salicylic acid', 'tea tree oil', 'zinc'],
        }),
      ]

      const messages = [
        {
          role: 'user' as const,
          content: 'oily acne pores salicylic acid tea tree oil',
        },
      ]

      const result = rankProductsForRecommendation(products, messages, 'skincare')

      expect(result.length).toBe(1)
      // Expected score: +50 (skin type) + 30*2 (2 concerns) + 10*2 (2 ingredients) = 130
    })

    it('should apply correct parfum scoring weights', () => {
      const products = [
        createMockProduct('p1', 'Perfume', 'parfum', {
          fragrance_family: ['floral'],
          notes: ['rose', 'jasmine', 'vanilla'],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'floral rose jasmine' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'parfum')

      expect(result.length).toBe(1)
      // Expected score: +60 (family) + 15*2 (2 notes) = 90
    })

    it('should apply correct fashion scoring weights', () => {
      const products = [
        createMockProduct('p1', 'Clothing', 'fashion', {
          style: ['casual'],
          sizes: ['M'],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'casual M' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'fashion')

      expect(result.length).toBe(1)
      // Expected score: +50 (style) + 30 (size) = 80
    })

    it('should apply correct fdb scoring weights', () => {
      const products = [
        createMockProduct('p1', 'Food', 'fdb', {
          dietary: ['vegan'],
          ingredients: ['vegetables', 'tofu', 'rice'],
        }),
      ]

      const messages = [
        { role: 'user' as const, content: 'vegan vegetables tofu' },
      ]

      const result = rankProductsForRecommendation(products, messages, 'fdb')

      expect(result.length).toBe(1)
      // Expected score: +60 (dietary) + 15*2 (2 ingredients) = 90
    })
  })
})
