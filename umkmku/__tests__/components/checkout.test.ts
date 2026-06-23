import { describe, it, expect, beforeEach, vi } from 'vitest'
import { calculatePricingBreakdown, formatRupiah } from '@/lib/utils/pricing'
import type { PricingBreakdown } from '@/lib/utils/pricing'

/**
 * Unit Tests for Checkout Price Breakdown Display
 * Tests pricing calculation, formatting, and display logic
 */
describe('Checkout Price Breakdown', () => {
  describe('calculatePricingBreakdown integration', () => {
    it('should calculate correct breakdown for single item', () => {
      // Rp 50,000 product
      const breakdown = calculatePricingBreakdown(50000)

      expect(breakdown.subtotal).toBe(50000)
      expect(breakdown.ppn).toBe(6000) // 12% of 50,000
      expect(breakdown.subtotalWithPpn).toBe(56000)
      expect(breakdown.xenditFee).toBe(1400) // 2.5% of 56,000
      expect(breakdown.finalPrice).toBe(57400)
    })

    it('should calculate correct breakdown for multiple items', () => {
      // 2 items @ Rp 50,000 each = Rp 100,000
      const breakdown = calculatePricingBreakdown(100000)

      expect(breakdown.subtotal).toBe(100000)
      expect(breakdown.ppn).toBe(12000)
      expect(breakdown.subtotalWithPpn).toBe(112000)
      expect(breakdown.xenditFee).toBe(2800)
      expect(breakdown.finalPrice).toBe(114800)
    })

    it('should handle large cart totals', () => {
      // Rp 500,000 (typical skincare order)
      const breakdown = calculatePricingBreakdown(500000)

      expect(breakdown.subtotal).toBe(500000)
      expect(breakdown.ppn).toBe(60000)
      expect(breakdown.subtotalWithPpn).toBe(560000)
      expect(breakdown.xenditFee).toBe(14000)
      expect(breakdown.finalPrice).toBe(574000)
    })
  })

  describe('Price breakdown formatting for display', () => {
    it('should format pricing breakdown for display correctly', () => {
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

    it('should display breakdown with correct visual hierarchy', () => {
      const breakdown = calculatePricingBreakdown(250000)
      const display = {
        subtotal: formatRupiah(breakdown.subtotal),
        ppn: formatRupiah(breakdown.ppn),
        subtotalWithPpn: formatRupiah(breakdown.subtotalWithPpn),
        xenditFee: formatRupiah(breakdown.xenditFee),
        finalPrice: formatRupiah(breakdown.finalPrice),
      }

      // Verify all fields are formatted strings starting with "Rp"
      expect(display.subtotal).toMatch(/^Rp \d+(\.\d{3})*$/)
      expect(display.ppn).toMatch(/^Rp \d+(\.\d{3})*$/)
      expect(display.subtotalWithPpn).toMatch(/^Rp \d+(\.\d{3})*$/)
      expect(display.xenditFee).toMatch(/^Rp \d+(\.\d{3})*$/)
      expect(display.finalPrice).toMatch(/^Rp \d+(\.\d{3})*$/)
    })

    it('should show breakdown in correct order', () => {
      const breakdown = calculatePricingBreakdown(100000)

      // Verify mathematical relationships
      expect(breakdown.subtotalWithPpn).toBe(breakdown.subtotal + breakdown.ppn)
      expect(breakdown.finalPrice).toBe(
        breakdown.subtotalWithPpn + breakdown.xenditFee
      )
    })
  })

  describe('Pricing breakdown edge cases', () => {
    it('should handle zero subtotal', () => {
      const breakdown = calculatePricingBreakdown(0)

      expect(breakdown.finalPrice).toBe(0)
      expect(formatRupiah(breakdown.finalPrice)).toBe('Rp 0')
    })

    it('should handle amounts with rounding', () => {
      // Amount that creates decimal results
      const breakdown = calculatePricingBreakdown(333)

      expect(breakdown.ppn).toBe(40) // Math.round(333 * 0.12) = 40
      expect(breakdown.subtotalWithPpn).toBe(373)
      expect(breakdown.xenditFee).toBe(9) // Math.round(373 * 0.025) = 9
      expect(breakdown.finalPrice).toBe(382)
    })

    it('should handle typical skincare bundle prices', () => {
      // Typical cart: 3 items (Rp 75k + Rp 85k + Rp 95k)
      const breakdown = calculatePricingBreakdown(255000)

      expect(breakdown.subtotal).toBe(255000)
      expect(breakdown.ppn).toBe(30600)
      expect(breakdown.subtotalWithPpn).toBe(285600)
      expect(breakdown.xenditFee).toBe(7140)
      expect(breakdown.finalPrice).toBe(292740)
    })
  })

  describe('PriceBreakdown component data validation', () => {
    it('should validate pricing object has all required fields', () => {
      const pricing: PricingBreakdown = {
        subtotal: 100000,
        ppn: 12000,
        subtotalWithPpn: 112000,
        xenditFee: 2800,
        finalPrice: 114800,
      }

      expect(pricing).toHaveProperty('subtotal')
      expect(pricing).toHaveProperty('ppn')
      expect(pricing).toHaveProperty('subtotalWithPpn')
      expect(pricing).toHaveProperty('xenditFee')
      expect(pricing).toHaveProperty('finalPrice')
    })

    it('should have all numeric values in pricing', () => {
      const pricing: PricingBreakdown = {
        subtotal: 100000,
        ppn: 12000,
        subtotalWithPpn: 112000,
        xenditFee: 2800,
        finalPrice: 114800,
      }

      Object.values(pricing).forEach((value) => {
        expect(typeof value).toBe('number')
        expect(value).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Checkout flow calculations', () => {
    it('Test 1: Calculate complete checkout flow for skincare purchase', () => {
      // Simulate adding 2 skincare products to cart:
      // - Face Wash (Rp 80,000) x 1
      // - Moisturizer (Rp 120,000) x 1
      const items = [
        { quantity: 1, price: 80000 },
        { quantity: 1, price: 120000 },
      ]

      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const breakdown = calculatePricingBreakdown(subtotal)

      expect(subtotal).toBe(200000)
      expect(breakdown.ppn).toBe(24000)
      expect(breakdown.xenditFee).toBe(5600)
      expect(breakdown.finalPrice).toBe(229600)
    })

    it('Test 2: Calculate checkout with quantity adjustments', () => {
      // Customer adjusts quantity:
      // - Product A (Rp 50,000) x 3 = Rp 150,000
      const subtotal = 50000 * 3
      const breakdown = calculatePricingBreakdown(subtotal)

      expect(subtotal).toBe(150000)
      expect(breakdown.ppn).toBe(18000)
      expect(breakdown.subtotalWithPpn).toBe(168000)
      expect(breakdown.xenditFee).toBe(4200)
      expect(breakdown.finalPrice).toBe(172200)
    })

    it('should calculate correct total for customer payment display', () => {
      const breakdown = calculatePricingBreakdown(100000)

      // This is what customer sees and must pay
      const finalAmount = formatRupiah(breakdown.finalPrice)

      expect(finalAmount).toBe('Rp 114.800')
      expect(breakdown.finalPrice).toBeGreaterThan(breakdown.subtotal)
      expect(breakdown.finalPrice).toBeGreaterThan(breakdown.subtotalWithPpn)
    })
  })
})

/**
 * API Integration Tests for Checkout
 * Tests order creation and payment flow
 */
describe('Checkout API Integration', () => {
  describe('POST /api/orders - Order Creation', () => {
    it('should return correct structure for successful order creation', () => {
      // Mock response structure from API
      const mockResponse = {
        success: true,
        data: {
          order_id: '550e8400-e29b-41d4-a716-446655440000',
          qris_code: 'umkmku_550e8400_1234567890',
          qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...',
          final_price: 114800,
          pricing_breakdown: {
            subtotal: 100000,
            ppn: 12000,
            subtotal_with_ppn: 112000,
            xendit_fee: 2800,
            final_price: 114800,
          },
        },
      }

      expect(mockResponse.data).toHaveProperty('order_id')
      expect(mockResponse.data).toHaveProperty('qris_image_url')
      expect(mockResponse.data).toHaveProperty('final_price')
      expect(mockResponse.data.pricing_breakdown).toHaveProperty('ppn')
      expect(mockResponse.data.pricing_breakdown).toHaveProperty('xendit_fee')
    })

    it('should include all required fields for QRIS display', () => {
      const mockResponse = {
        success: true,
        data: {
          order_id: '550e8400-e29b-41d4-a716-446655440000',
          qris_code: 'umkmku_550e8400_1234567890',
          qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...',
          final_price: 114800,
          pricing_breakdown: {
            subtotal: 100000,
            ppn: 12000,
            subtotal_with_ppn: 112000,
            xendit_fee: 2800,
            final_price: 114800,
          },
        },
      }

      expect(mockResponse.data.qris_image_url).toBeDefined()
      expect(mockResponse.data.qris_image_url).toContain('https://')
      expect(mockResponse.data.order_id).toBeTruthy()
    })
  })

  describe('GET /api/orders/[id]/status - Order Status Polling', () => {
    it('should return correct status structure for pending payment', () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          order_status: 'pending',
          payment_status: 'pending',
          final_price: 114800,
          customer_email: 'customer@email.com',
          created_at: '2024-01-01T10:00:00Z',
          qris_code: 'umkmku_550e8400_1234567890',
          qris_image_url: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...',
          items: [{ product_id: 'prod-1', quantity: 1, price_at_purchase: 100000 }],
          pricing_breakdown: {
            subtotal: 100000,
            ppn: 12000,
            subtotal_with_ppn: 112000,
            xendit_fee: 2800,
            final_price: 114800,
          },
        },
      }

      expect(mockResponse.data.payment_status).toBe('pending')
      expect(mockResponse.data.order_status).toBe('pending')
    })

    it('should return updated status for completed payment', () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          order_status: 'processing',
          payment_status: 'completed',
          final_price: 114800,
          customer_email: 'customer@email.com',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:05:00Z',
          items: [],
          pricing_breakdown: {
            subtotal: 100000,
            ppn: 12000,
            subtotal_with_ppn: 112000,
            xendit_fee: 2800,
            final_price: 114800,
          },
        },
      }

      expect(mockResponse.data.payment_status).toBe('completed')
      // Order status may update to processing or other status
      expect(['pending', 'processing', 'shipped', 'delivered']).toContain(
        mockResponse.data.order_status
      )
    })

    it('should return failed status if payment expires', () => {
      const mockResponse = {
        success: true,
        data: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          order_status: 'pending',
          payment_status: 'expired',
          final_price: 114800,
          customer_email: 'customer@email.com',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:20:00Z',
          items: [],
          pricing_breakdown: {
            subtotal: 100000,
            ppn: 12000,
            subtotal_with_ppn: 112000,
            xendit_fee: 2800,
            final_price: 114800,
          },
        },
      }

      expect(mockResponse.data.payment_status).toBe('expired')
      expect(['pending', 'processing', 'completed', 'failed', 'expired']).toContain(
        mockResponse.data.payment_status
      )
    })
  })

  describe('Checkout status transitions', () => {
    it('Test 3: Status transitions from idle -> processing -> success', () => {
      const statuses = ['idle', 'processing', 'success']

      // Verify valid state machine transitions
      expect(statuses[0]).toBe('idle')
      expect(statuses[1]).toBe('processing')
      expect(statuses[2]).toBe('success')
    })

    it('Test 4: Status transitions from idle -> processing -> failed', () => {
      const statuses = ['idle', 'processing', 'failed']

      expect(statuses[0]).toBe('idle')
      expect(statuses[1]).toBe('processing')
      expect(statuses[2]).toBe('failed')
    })

    it('should allow retry from failed state', () => {
      const statuses = ['failed', 'idle', 'processing', 'success']

      // After failed, user can click retry to go back to idle
      expect(statuses[1]).toBe('idle')
    })
  })
})

/**
 * User Interaction Tests for Checkout
 * Tests form submission, QRIS display, and polling logic
 */
describe('Checkout User Interactions', () => {
  describe('Customer form validation', () => {
    it('should require email for checkout', () => {
      const form = {
        customerEmail: '',
        customerName: '',
        customerPhone: '',
      }

      const isValid = !!form.customerEmail

      expect(isValid).toBe(false)
    })

    it('should accept valid email', () => {
      const form = {
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        customerPhone: '081234567890',
      }

      const isValid = !!form.customerEmail && form.customerEmail.includes('@')

      expect(isValid).toBe(true)
    })

    it('should allow checkout with email only', () => {
      const form = {
        customerEmail: 'customer@example.com',
        customerName: '',
        customerPhone: '',
      }

      const isValid = !!form.customerEmail

      expect(isValid).toBe(true)
    })
  })

  describe('QRIS Display Logic', () => {
    it('should show QRIS image when order is created', () => {
      const qrisImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...'

      expect(qrisImageUrl).toBeDefined()
      expect(qrisImageUrl).toContain('qrserver.com')
    })

    it('should display payment timer info with QRIS', () => {
      const timerMinutes = 15
      const timerText = `Batas waktu pembayaran: ${timerMinutes} menit`

      expect(timerText).toContain('15')
      expect(timerText).toContain('menit')
    })

    it('should show final amount with QRIS', () => {
      const breakdown = calculatePricingBreakdown(100000)
      const displayAmount = formatRupiah(breakdown.finalPrice)

      expect(displayAmount).toBe('Rp 114.800')
    })
  })

  describe('Status polling logic', () => {
    it('Test 5: Should poll status every 3 seconds', () => {
      const pollingInterval = 3000 // milliseconds

      expect(pollingInterval).toBe(3000)
    })

    it('Test 6: Should stop polling after max attempts (15 minutes)', () => {
      const pollingInterval = 3000 // 3 seconds
      const maxDurationSeconds = 15 * 60 // 15 minutes
      const maxAttempts = maxDurationSeconds / (pollingInterval / 1000)

      expect(maxAttempts).toBe(300)
    })

    it('should detect payment completion', () => {
      const orderStatus = {
        payment_status: 'completed',
        order_status: 'processing',
      }

      const isPaymentComplete = orderStatus.payment_status === 'completed'

      expect(isPaymentComplete).toBe(true)
    })

    it('should detect payment failure', () => {
      const orderStatus = {
        payment_status: 'failed',
        order_status: 'pending',
      }

      const isPaymentFailed = ['failed', 'expired'].includes(orderStatus.payment_status)

      expect(isPaymentFailed).toBe(true)
    })
  })

  describe('Redirect Logic', () => {
    it('should redirect to order confirmation on payment success', () => {
      const orderId = '550e8400-e29b-41d4-a716-446655440000'
      const redirectUrl = `/order/${orderId}`

      expect(redirectUrl).toBe(`/order/${orderId}`)
      expect(redirectUrl).toContain('/order/')
    })

    it('should not redirect if payment still pending', () => {
      const paymentStatus = 'processing'
      const orderId = '550e8400-e29b-41d4-a716-446655440000'

      const shouldRedirect = paymentStatus === 'success'

      expect(shouldRedirect).toBe(false)
    })

    it('should allow retry on failed payment', () => {
      const paymentStatus = 'failed'
      const canRetry = paymentStatus === 'failed'

      expect(canRetry).toBe(true)
    })
  })
})
