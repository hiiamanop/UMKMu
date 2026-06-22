import { describe, it, expect } from 'vitest'
import {
  validateCategoryData,
  getCategorySystemPrompt,
  type CategoryType,
  SkincareDataSchema,
  ParfumDataSchema,
  FashionDataSchema,
  FDBDataSchema,
} from '@/lib/categories'

describe('Skincare Category', () => {
  describe('SkincareDataSchema validation', () => {
    it('should validate valid skincare data', () => {
      const validData = {
        skin_types: ['oily', 'combination'],
        concerns: ['acne', 'brightening'],
        ingredients: ['niacinamide', 'vitamin-c'],
        usage_step: 'serum',
      }

      const result = SkincareDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.skin_types).toEqual(['oily', 'combination'])
        expect(result.data.usage_step).toBe('serum')
      }
    })

    it('should reject invalid skin_types', () => {
      const invalidData = {
        skin_types: ['invalid_type'],
        concerns: ['acne'],
        ingredients: [],
        usage_step: 'cleanser',
      }

      const result = SkincareDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid usage_step', () => {
      const invalidData = {
        skin_types: ['oily'],
        concerns: ['acne'],
        ingredients: [],
        usage_step: 'invalid_step',
      }

      const result = SkincareDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle all valid enum values', () => {
      const validData = {
        skin_types: ['oily', 'dry', 'combination', 'sensitive', 'all'],
        concerns: ['acne', 'brightening', 'anti-aging', 'hydrating', 'pores', 'sensitive'],
        ingredients: ['ingredient1'],
        usage_step: 'moisturizer',
      }

      const result = SkincareDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow empty ingredients array', () => {
      const validData = {
        skin_types: ['all'],
        concerns: ['acne'],
        ingredients: [],
        usage_step: 'toner',
      }

      const result = SkincareDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateCategoryData for skincare', () => {
    it('should return success for valid skincare data', () => {
      const data = {
        skin_types: ['oily'],
        concerns: ['acne'],
        ingredients: ['salicylic acid'],
        usage_step: 'cleanser',
      }

      const result = validateCategoryData('skincare', data)
      expect(result.success).toBe(true)
    })

    it('should return error for invalid skincare data', () => {
      const data = {
        skin_types: ['invalid'],
        concerns: ['acne'],
        ingredients: [],
        usage_step: 'cleanser',
      }

      const result = validateCategoryData('skincare', data)
      expect(result.success).toBe(false)
    })
  })
})

describe('Parfum Category', () => {
  describe('ParfumDataSchema validation', () => {
    it('should validate valid parfum data', () => {
      const validData = {
        fragrance_family: ['floral', 'woody'],
        notes_top: ['bergamot', 'lemon'],
        notes_middle: ['rose', 'jasmine'],
        notes_base: ['sandalwood', 'musk'],
        size: '50',
        longevity: 'long-lasting',
      }

      const result = ParfumDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.size).toBe('50')
        expect(result.data.longevity).toBe('long-lasting')
      }
    })

    it('should reject invalid size', () => {
      const invalidData = {
        fragrance_family: ['floral'],
        notes_top: ['note'],
        notes_middle: ['note'],
        notes_base: ['note'],
        size: '75',
        longevity: 'long-lasting',
      }

      const result = ParfumDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle all valid size values', () => {
      const sizes = ['30', '50', '100', '200'] as const

      for (const size of sizes) {
        const validData = {
          fragrance_family: ['floral'],
          notes_top: ['note'],
          notes_middle: ['note'],
          notes_base: ['note'],
          size,
          longevity: 'moderate',
        }

        const result = ParfumDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })

    it('should handle all valid longevity values', () => {
      const longevities = ['light', 'moderate', 'long-lasting'] as const

      for (const longevity of longevities) {
        const validData = {
          fragrance_family: ['fresh'],
          notes_top: ['note'],
          notes_middle: ['note'],
          notes_base: ['note'],
          size: '100',
          longevity,
        }

        const result = ParfumDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })
  })

  describe('validateCategoryData for parfum', () => {
    it('should return success for valid parfum data', () => {
      const data = {
        fragrance_family: ['oriental'],
        notes_top: ['vanilla'],
        notes_middle: ['amber'],
        notes_base: ['musk'],
        size: '100',
        longevity: 'long-lasting',
      }

      const result = validateCategoryData('parfum', data)
      expect(result.success).toBe(true)
    })
  })
})

describe('Fashion Category', () => {
  describe('FashionDataSchema validation', () => {
    it('should validate valid fashion data', () => {
      const validData = {
        sizes: ['XS', 'S', 'M', 'L'],
        colors: ['black', 'white', 'blue'],
        materials: ['cotton', 'polyester'],
        fit: 'regular',
        style: ['casual', 'sporty'],
      }

      const result = FashionDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.fit).toBe('regular')
        expect(result.data.style).toContain('casual')
      }
    })

    it('should reject invalid fit', () => {
      const invalidData = {
        sizes: ['M'],
        colors: ['black'],
        materials: ['cotton'],
        fit: 'custom',
        style: ['casual'],
      }

      const result = FashionDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle all valid fit values', () => {
      const fits = ['slim', 'regular', 'relaxed', 'oversized'] as const

      for (const fit of fits) {
        const validData = {
          sizes: ['M'],
          colors: ['black'],
          materials: ['cotton'],
          fit,
          style: ['casual'],
        }

        const result = FashionDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })

    it('should allow empty or custom values for sizes, colors, materials, and styles', () => {
      const validData = {
        sizes: ['one-size'],
        colors: ['rainbow'],
        materials: ['fabric-blend'],
        fit: 'oversized',
        style: ['unique-style'],
      }

      const result = FashionDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateCategoryData for fashion', () => {
    it('should return success for valid fashion data', () => {
      const data = {
        sizes: ['S', 'M', 'L'],
        colors: ['navy', 'white'],
        materials: ['linen'],
        fit: 'relaxed',
        style: ['casual', 'minimalist'],
      }

      const result = validateCategoryData('fashion', data)
      expect(result.success).toBe(true)
    })
  })
})

describe('F&B Category', () => {
  describe('FDBDataSchema validation', () => {
    it('should validate valid FDB data', () => {
      const validData = {
        ingredients: ['flour', 'sugar', 'butter'],
        allergens: ['gluten', 'dairy'],
        preparation_time: 30,
        servings: 4,
        dietary: ['vegetarian'],
      }

      const result = FDBDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.preparation_time).toBe(30)
        expect(result.data.servings).toBe(4)
      }
    })

    it('should reject invalid preparation_time', () => {
      const invalidData = {
        ingredients: ['flour'],
        allergens: [],
        preparation_time: -5,
        servings: 2,
        dietary: [],
      }

      const result = FDBDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should reject invalid servings', () => {
      const invalidData = {
        ingredients: ['flour'],
        allergens: [],
        preparation_time: 30,
        servings: 0,
        dietary: [],
      }

      const result = FDBDataSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
    })

    it('should handle all valid dietary values', () => {
      const dietaries = ['vegan', 'vegetarian', 'gluten-free', 'halal'] as const

      for (const dietary of dietaries) {
        const validData = {
          ingredients: ['ingredient'],
          allergens: [],
          preparation_time: 20,
          servings: 2,
          dietary: [dietary],
        }

        const result = FDBDataSchema.safeParse(validData)
        expect(result.success).toBe(true)
      }
    })

    it('should allow empty allergens array', () => {
      const validData = {
        ingredients: ['rice'],
        allergens: [],
        preparation_time: 45,
        servings: 6,
        dietary: ['halal'],
      }

      const result = FDBDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should allow multiple dietary preferences', () => {
      const validData = {
        ingredients: ['chickpea', 'vegetable'],
        allergens: [],
        preparation_time: 60,
        servings: 4,
        dietary: ['vegan', 'gluten-free', 'halal'],
      }

      const result = FDBDataSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe('validateCategoryData for fdb', () => {
    it('should return success for valid FDB data', () => {
      const data = {
        ingredients: ['milk', 'sugar', 'cocoa'],
        allergens: ['dairy', 'tree nuts'],
        preparation_time: 15,
        servings: 2,
        dietary: ['vegetarian'],
      }

      const result = validateCategoryData('fdb', data)
      expect(result.success).toBe(true)
    })
  })
})

describe('getCategorySystemPrompt', () => {
  it('should return skincare system prompt with variables replaced', () => {
    const vars = {
      brand_name: 'Glow Skincare',
      description: 'Natural skincare for glowing skin',
      products_json: '[{"name": "Cleanser", "id": "prod-1"}]',
    }

    const prompt = getCategorySystemPrompt('skincare', vars)

    expect(prompt).toContain('Glow Skincare')
    expect(prompt).toContain('Natural skincare for glowing skin')
    expect(prompt).toContain('[{"name": "Cleanser", "id": "prod-1"}]')
    expect(prompt).toContain('skincare advisor')
    expect(prompt).not.toContain('{brand_name}')
  })

  it('should return parfum system prompt with variables replaced', () => {
    const vars = {
      brand_name: 'Scent Co',
      description: 'Premium fragrances',
      products_json: '[{"name": "Oud", "id": "prod-2"}]',
    }

    const prompt = getCategorySystemPrompt('parfum', vars)

    expect(prompt).toContain('Scent Co')
    expect(prompt).toContain('Premium fragrances')
    expect(prompt).toContain('fragrance advisor')
    expect(prompt).not.toContain('{description}')
  })

  it('should return fashion system prompt with variables replaced', () => {
    const vars = {
      brand_name: 'Fashion House',
      description: 'Modern fashion for everyday wear',
      products_json: '[{"name": "Dress", "id": "prod-3"}]',
    }

    const prompt = getCategorySystemPrompt('fashion', vars)

    expect(prompt).toContain('Fashion House')
    expect(prompt).toContain('fashion stylist')
    expect(prompt).toContain('Modern fashion for everyday wear')
  })

  it('should return fdb system prompt with variables replaced', () => {
    const vars = {
      brand_name: 'Food Artisan',
      description: 'Handmade delicacies',
      products_json: '[{"name": "Cake", "id": "prod-4"}]',
    }

    const prompt = getCategorySystemPrompt('fdb', vars)

    expect(prompt).toContain('Food Artisan')
    expect(prompt).toContain('food & beverage advisor')
    expect(prompt).toContain('Handmade delicacies')
  })

  it('should throw error for unknown category', () => {
    const vars = {
      brand_name: 'Test',
      description: 'Test',
      products_json: '[]',
    }

    expect(() => {
      getCategorySystemPrompt('unknown' as CategoryType, vars)
    }).toThrow('Unknown category')
  })

  it('should handle special characters in variables', () => {
    const vars = {
      brand_name: 'Test & Co. "Premium"',
      description: 'Test <brand> @ special chars',
      products_json: '{"test": "value"}',
    }

    const prompt = getCategorySystemPrompt('skincare', vars)

    expect(prompt).toContain('Test & Co. "Premium"')
    expect(prompt).toContain('Test <brand> @ special chars')
    expect(prompt).toContain('{"test": "value"}')
  })
})

describe('validateCategoryData edge cases', () => {
  it('should return error for unknown category', () => {
    const result = validateCategoryData('unknown' as CategoryType, {})
    expect(result.success).toBe(false)
  })

  it('should handle null data', () => {
    const result = validateCategoryData('skincare', null)
    expect(result.success).toBe(false)
  })

  it('should handle undefined data', () => {
    const result = validateCategoryData('skincare', undefined)
    expect(result.success).toBe(false)
  })

  it('should handle missing required fields', () => {
    const result = validateCategoryData('skincare', {
      skin_types: ['oily'],
    })
    expect(result.success).toBe(false)
  })

  it('should handle extra fields (should be ignored by zod default)', () => {
    const data = {
      skin_types: ['oily'],
      concerns: ['acne'],
      ingredients: [],
      usage_step: 'cleanser',
      extra_field: 'should be ignored',
    }

    const result = validateCategoryData('skincare', data)
    // Zod by default ignores extra fields
    expect(result.success).toBe(true)
  })
})

describe('All categories integration', () => {
  it('should support all four categories in validateCategoryData', () => {
    const categories: CategoryType[] = ['skincare', 'parfum', 'fashion', 'fdb']
    const validDataSamples = {
      skincare: {
        skin_types: ['oily'],
        concerns: ['acne'],
        ingredients: [],
        usage_step: 'cleanser',
      },
      parfum: {
        fragrance_family: ['fresh'],
        notes_top: ['note'],
        notes_middle: ['note'],
        notes_base: ['note'],
        size: '50',
        longevity: 'moderate',
      },
      fashion: {
        sizes: ['M'],
        colors: ['black'],
        materials: ['cotton'],
        fit: 'regular',
        style: ['casual'],
      },
      fdb: {
        ingredients: ['flour'],
        allergens: [],
        preparation_time: 30,
        servings: 4,
        dietary: [],
      },
    }

    for (const category of categories) {
      const result = validateCategoryData(category, validDataSamples[category])
      expect(result.success).toBe(true, `${category} validation should pass`)
    }
  })

  it('should support all four categories in getCategorySystemPrompt', () => {
    const categories: CategoryType[] = ['skincare', 'parfum', 'fashion', 'fdb']
    const vars = {
      brand_name: 'Test Brand',
      description: 'Test Description',
      products_json: '[]',
    }

    for (const category of categories) {
      const prompt = getCategorySystemPrompt(category, vars)
      expect(prompt).toContain('Test Brand')
      expect(prompt).toBeTruthy()
    }
  })
})
