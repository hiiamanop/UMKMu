import { describe, it, expect } from 'vitest'
import { parseRecommendations } from '@/lib/ai/chatbot'

describe('parseRecommendations', () => {
  it('returns empty when no recommendations', () => {
    const result = parseRecommendations('Halo, ada yang bisa saya bantu?')
    expect(result.productIds).toHaveLength(0)
    expect(result.cleanText).toBe('Halo, ada yang bisa saya bantu?')
  })

  it('parses single recommendation', () => {
    const text = 'Saya rekomendasikan serum ini untuk kulit kamu. [[RECOMMEND:abc-123]]'
    const result = parseRecommendations(text)
    expect(result.productIds).toEqual(['abc-123'])
    expect(result.cleanText).toBe('Saya rekomendasikan serum ini untuk kulit kamu.')
  })

  it('parses multiple recommendations', () => {
    const text = 'Dua produk ini bagus untuk kamu. [[RECOMMEND:id-1]] [[RECOMMEND:id-2]]'
    const result = parseRecommendations(text)
    expect(result.productIds).toHaveLength(2)
    expect(result.productIds).toContain('id-1')
    expect(result.productIds).toContain('id-2')
  })

  it('handles recommendation at start of text', () => {
    const text = '[[RECOMMEND:xyz]] Produk ini cocok!'
    const result = parseRecommendations(text)
    expect(result.productIds).toEqual(['xyz'])
    expect(result.cleanText).toContain('Produk ini cocok!')
  })
})
