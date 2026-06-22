import { describe, it, expect } from 'vitest'
import { generateSlug, extractedConfigSchema, getOnboardingSystemPrompt } from '@/lib/ai/onboarding'
import { validateCategoryData, type CategoryType } from '@/lib/categories'

describe('generateSlug', () => {
  it('converts brand name to slug', () => {
    expect(generateSlug('Glow.id')).toBe('glowid')
  })

  it('handles spaces', () => {
    expect(generateSlug('Dapur Bunda')).toBe('dapur-bunda')
  })

  it('handles multiple spaces', () => {
    expect(generateSlug('My  Brand  Name')).toBe('my-brand-name')
  })

  it('truncates to 50 chars', () => {
    const long = 'a'.repeat(60)
    expect(generateSlug(long)).toHaveLength(50)
  })
})

describe('extractedConfigSchema', () => {
  it('validates valid config', () => {
    const valid = {
      brand_name: 'Glow.id',
      tagline: 'Glow from within',
      description: 'Brand skincare lokal',
      primary_color: '#1a1a1a',
      secondary_color: '#f5f5f5',
      accent_color: '#d4a574',
      whatsapp_number: '08123456789',
      instagram_url: null,
      chatbot_persona: 'Friendly beauty expert',
      products: [{
        name: 'Vitamin C Serum',
        description: 'Mencerahkan kulit',
        price: 150000,
      }],
    }
    expect(() => extractedConfigSchema.parse(valid)).not.toThrow()
  })

  it('rejects invalid hex color', () => {
    const invalid = {
      brand_name: 'Test',
      tagline: null,
      description: 'Test',
      primary_color: 'red',  // invalid
      secondary_color: '#f5f5f5',
      accent_color: '#d4a574',
      whatsapp_number: null,
      instagram_url: null,
      chatbot_persona: 'test',
      products: [],
    }
    expect(() => extractedConfigSchema.parse(invalid)).toThrow()
  })
})

describe('getOnboardingSystemPrompt', () => {
  it('returns system prompt for skincare category', () => {
    const prompt = getOnboardingSystemPrompt('skincare')
    expect(prompt).toContain('skincare')
    expect(prompt).toContain('skin_types')
    expect(prompt).toContain('concerns')
  })

  it('returns system prompt for parfum category', () => {
    const prompt = getOnboardingSystemPrompt('parfum')
    expect(prompt).toContain('parfum')
    expect(prompt).toContain('fragrance_family')
    expect(prompt).toContain('notes_top')
  })

  it('returns system prompt for fashion category', () => {
    const prompt = getOnboardingSystemPrompt('fashion')
    expect(prompt).toContain('fashion')
    expect(prompt).toContain('sizes')
    expect(prompt).toContain('fit')
  })

  it('returns system prompt for fdb category', () => {
    const prompt = getOnboardingSystemPrompt('fdb')
    expect(prompt).toContain('F&B')
    expect(prompt).toContain('allergens')
    expect(prompt).toContain('dietary')
  })

  it('contains JSON instruction', () => {
    const categories: CategoryType[] = ['skincare', 'parfum', 'fashion', 'fdb']
    categories.forEach((category) => {
      const prompt = getOnboardingSystemPrompt(category)
      expect(prompt).toContain('JSON')
    })
  })
})

describe('validateCategoryData', () => {
  it('validates skincare data', () => {
    const data = {
      skin_types: ['oily'],
      concerns: ['acne'],
      ingredients: ['niacinamide'],
      usage_step: 'serum',
    }
    const result = validateCategoryData('skincare', data)
    expect(result.success).toBe(true)
  })

  it('rejects invalid skincare skin_type', () => {
    const data = {
      skin_types: ['invalid-type'],
      concerns: ['acne'],
      ingredients: [],
      usage_step: 'serum',
    }
    const result = validateCategoryData('skincare', data)
    expect(result.success).toBe(false)
  })

  it('validates parfum data', () => {
    const data = {
      fragrance_family: ['floral'],
      notes_top: ['bergamot'],
      notes_middle: ['jasmine'],
      notes_base: ['sandalwood'],
      size: '50',
      longevity: 'long-lasting',
    }
    const result = validateCategoryData('parfum', data)
    expect(result.success).toBe(true)
  })

  it('validates fashion data', () => {
    const data = {
      sizes: ['S', 'M', 'L'],
      colors: ['red', 'blue'],
      materials: ['cotton'],
      fit: 'regular',
      style: ['casual', 'sporty'],
    }
    const result = validateCategoryData('fashion', data)
    expect(result.success).toBe(true)
  })

  it('validates fdb data', () => {
    const data = {
      ingredients: ['flour', 'sugar'],
      allergens: ['gluten', 'dairy'],
      preparation_time: 30,
      servings: 4,
      dietary: ['vegan', 'halal'],
    }
    const result = validateCategoryData('fdb', data)
    expect(result.success).toBe(true)
  })

  it('rejects unknown category', () => {
    const data = { some: 'data' }
    const result = validateCategoryData('unknown' as CategoryType, data)
    expect(result.success).toBe(false)
  })
})
