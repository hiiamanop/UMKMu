import { describe, it, expect } from 'vitest'
import { generateSlug, extractedConfigSchema } from '@/lib/ai/onboarding'

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
        skin_types: ['oily', 'combination'],
        concerns: ['brightening'],
        ingredients: ['vitamin-c'],
        usage_step: 'serum',
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
