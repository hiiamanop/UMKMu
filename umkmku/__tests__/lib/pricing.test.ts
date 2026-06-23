import { describe, it, expect } from 'vitest'
import {
  calculatePricingBreakdown,
  formatRupiah,
  parseRupiah,
  type PricingBreakdown,
} from '@/lib/utils/pricing'

describe('Pricing Utilities', () => {
  describe('calculatePricingBreakdown', () => {
    it('Test 1: Calculate exact breakdown for Rp 100,000 subtotal', () => {
      const result = calculatePricingBreakdown(100000)

      expect(result).toEqual({
        subtotal: 100000,
        ppn: 12000,
        subtotalWithPpn: 112000,
        xenditFee: 2800,
        finalPrice: 114800,
      })
    })

    it('Test 2: Handle rounding behavior with non-integer percentages', () => {
      // Using 123456 which creates non-integer percentages
      const result = calculatePricingBreakdown(123456)

      // ppn = Math.round(123456 * 0.12) = Math.round(14814.72) = 14815
      // subtotalWithPpn = 123456 + 14815 = 138271
      // xenditFee = Math.round(138271 * 0.025) = Math.round(3456.775) = 3457
      // finalPrice = 138271 + 3457 = 141728
      expect(result.subtotal).toBe(123456)
      expect(result.ppn).toBe(14815)
      expect(result.subtotalWithPpn).toBe(138271)
      expect(result.xenditFee).toBe(3457)
      expect(result.finalPrice).toBe(141728)
    })

    it('should return PricingBreakdown with all required fields', () => {
      const result = calculatePricingBreakdown(50000)

      // Verify all fields exist
      expect(result).toHaveProperty('subtotal')
      expect(result).toHaveProperty('ppn')
      expect(result).toHaveProperty('subtotalWithPpn')
      expect(result).toHaveProperty('xenditFee')
      expect(result).toHaveProperty('finalPrice')

      // Verify all values are numbers
      expect(typeof result.subtotal).toBe('number')
      expect(typeof result.ppn).toBe('number')
      expect(typeof result.subtotalWithPpn).toBe('number')
      expect(typeof result.xenditFee).toBe('number')
      expect(typeof result.finalPrice).toBe('number')
    })

    it('should handle zero subtotal', () => {
      const result = calculatePricingBreakdown(0)

      expect(result).toEqual({
        subtotal: 0,
        ppn: 0,
        subtotalWithPpn: 0,
        xenditFee: 0,
        finalPrice: 0,
      })
    })

    it('should handle large amounts', () => {
      const result = calculatePricingBreakdown(10000000) // Rp 10 juta

      expect(result.subtotal).toBe(10000000)
      expect(result.ppn).toBe(1200000) // 12% of 10M
      expect(result.subtotalWithPpn).toBe(11200000)
      expect(result.xenditFee).toBe(280000) // 2.5% of 11.2M
      expect(result.finalPrice).toBe(11480000)
    })
  })

  describe('formatRupiah', () => {
    it('Test 3: Format basic amount correctly', () => {
      const result = formatRupiah(100000)

      expect(result).toContain('Rp')
      expect(result).toContain('100')
      expect(result).toBe('Rp 100.000')
    })

    it('should format 1000 correctly', () => {
      expect(formatRupiah(1000)).toBe('Rp 1.000')
    })

    it('should format larger amounts with multiple separators', () => {
      expect(formatRupiah(1234567)).toBe('Rp 1.234.567')
    })

    it('should format millions correctly', () => {
      expect(formatRupiah(1000000)).toBe('Rp 1.000.000')
    })

    it('should handle zero', () => {
      expect(formatRupiah(0)).toBe('Rp 0')
    })

    it('should handle decimal amounts by rounding down', () => {
      expect(formatRupiah(123.99)).toBe('Rp 123')
    })
  })

  describe('parseRupiah', () => {
    it('Test 4: Parse formatted Rupiah string correctly', () => {
      const result = parseRupiah('Rp 100.000')

      expect(result).toBe(100000)
    })

    it('should parse larger formatted amounts', () => {
      expect(parseRupiah('Rp 1.234.567')).toBe(1234567)
    })

    it('should parse millions', () => {
      expect(parseRupiah('Rp 1.000.000')).toBe(1000000)
    })

    it('Test 5: Return 0 for invalid input', () => {
      expect(parseRupiah('invalid')).toBe(0)
      expect(parseRupiah('')).toBe(0)
      expect(parseRupiah('abc')).toBe(0)
    })

    it('should handle input without Rp prefix', () => {
      expect(parseRupiah('100.000')).toBe(100000)
    })

    it('should handle input with extra spaces', () => {
      expect(parseRupiah('Rp  100.000')).toBe(100000)
    })

    it('should handle mixed separators', () => {
      expect(parseRupiah('Rp 1.234.567')).toBe(1234567)
    })
  })

  describe('Round-trip formatting and parsing', () => {
    it('should format and parse correctly round-trip', () => {
      const original = 123456
      const formatted = formatRupiah(original)
      const parsed = parseRupiah(formatted)

      expect(parsed).toBe(original)
    })

    it('should handle round-trip with various amounts', () => {
      const amounts = [100, 1000, 10000, 100000, 1000000, 10000000]

      for (const amount of amounts) {
        const formatted = formatRupiah(amount)
        const parsed = parseRupiah(formatted)
        expect(parsed).toBe(amount)
      }
    })
  })

  describe('Integration: Pricing breakdown to display format', () => {
    it('should format pricing breakdown for display', () => {
      const breakdown = calculatePricingBreakdown(100000)

      const display = {
        subtotal: formatRupiah(breakdown.subtotal),
        ppn: formatRupiah(breakdown.ppn),
        subtotalWithPpn: formatRupiah(breakdown.subtotalWithPpn),
        xenditFee: formatRupiah(breakdown.xenditFee),
        finalPrice: formatRupiah(breakdown.finalPrice),
      }

      expect(display.subtotal).toBe('Rp 100.000')
      expect(display.ppn).toBe('Rp 12.000')
      expect(display.subtotalWithPpn).toBe('Rp 112.000')
      expect(display.xenditFee).toBe('Rp 2.800')
      expect(display.finalPrice).toBe('Rp 114.800')
    })
  })
})
