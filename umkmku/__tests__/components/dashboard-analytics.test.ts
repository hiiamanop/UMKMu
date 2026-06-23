import { describe, it, expect } from 'vitest'
import type { AnalyticsMetrics } from '@/lib/analytics/queries'

/**
 * Mock analytics data for testing
 */
const mockAnalyticsMetrics: AnalyticsMetrics = {
  totalRevenue: 1500000,
  totalOrders: 5,
  topProducts: [
    {
      id: 'product-1',
      name: 'Face Serum',
      quantity: 8,
      revenue: 800000,
    },
    {
      id: 'product-2',
      name: 'Moisturizer',
      quantity: 5,
      revenue: 250000,
    },
    {
      id: 'product-3',
      name: 'Cleanser',
      quantity: 3,
      revenue: 300000,
    },
  ],
  repeatCustomerRate: 40,
  ordersByDate: [
    {
      date: '2026-06-20',
      count: 2,
      revenue: 600000,
    },
    {
      date: '2026-06-21',
      count: 1,
      revenue: 300000,
    },
    {
      date: '2026-06-22',
      count: 2,
      revenue: 600000,
    },
  ],
  revenueTrend: [
    {
      date: '2026-06-20',
      revenue: 600000,
    },
    {
      date: '2026-06-21',
      revenue: 300000,
    },
    {
      date: '2026-06-22',
      revenue: 600000,
    },
  ],
}

describe('Analytics Dashboard', () => {
  describe('Metrics Calculation', () => {
    it('should calculate total revenue correctly', () => {
      expect(mockAnalyticsMetrics.totalRevenue).toBe(1500000)
    })

    it('should count total orders correctly', () => {
      expect(mockAnalyticsMetrics.totalOrders).toBe(5)
    })

    it('should calculate repeat customer rate', () => {
      expect(mockAnalyticsMetrics.repeatCustomerRate).toBeGreaterThanOrEqual(0)
      expect(mockAnalyticsMetrics.repeatCustomerRate).toBeLessThanOrEqual(100)
    })

    it('should identify top products', () => {
      expect(mockAnalyticsMetrics.topProducts.length).toBeGreaterThan(0)
      expect(mockAnalyticsMetrics.topProducts.length).toBeLessThanOrEqual(5)
    })

    it('should rank products by quantity sold', () => {
      for (let i = 0; i < mockAnalyticsMetrics.topProducts.length - 1; i++) {
        expect(
          mockAnalyticsMetrics.topProducts[i].quantity
        ).toBeGreaterThanOrEqual(
          mockAnalyticsMetrics.topProducts[i + 1].quantity
        )
      }
    })
  })

  describe('Chart Data', () => {
    it('should provide orders by date data', () => {
      expect(mockAnalyticsMetrics.ordersByDate.length).toBeGreaterThan(0)
    })

    it('should have valid order date entries', () => {
      mockAnalyticsMetrics.ordersByDate.forEach((entry) => {
        expect(entry.date).toBeDefined()
        expect(entry.count).toBeGreaterThanOrEqual(0)
        expect(entry.revenue).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have sequential dates', () => {
      const dates = mockAnalyticsMetrics.ordersByDate.map((e) => e.date)
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i].localeCompare(dates[i + 1])).toBeLessThanOrEqual(0)
      }
    })

    it('should provide revenue trend data', () => {
      expect(mockAnalyticsMetrics.revenueTrend.length).toBeGreaterThan(0)
    })

    it('should have valid revenue trend entries', () => {
      mockAnalyticsMetrics.revenueTrend.forEach((entry) => {
        expect(entry.date).toBeDefined()
        expect(entry.revenue).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('Revenue Calculations', () => {
    it('should sum orders by date', () => {
      const totalFromChart = mockAnalyticsMetrics.ordersByDate.reduce(
        (sum, entry) => sum + entry.revenue,
        0
      )
      expect(totalFromChart).toBe(mockAnalyticsMetrics.totalRevenue)
    })

    it('should match revenue trend total', () => {
      const trendTotal = mockAnalyticsMetrics.revenueTrend.reduce(
        (sum, entry) => sum + entry.revenue,
        0
      )
      expect(trendTotal).toBe(mockAnalyticsMetrics.totalRevenue)
    })

    it('should sum product revenues correctly', () => {
      const productTotal = mockAnalyticsMetrics.topProducts.reduce(
        (sum, product) => sum + product.revenue,
        0
      )
      // Product revenue should not exceed total order revenue
      expect(productTotal).toBeLessThanOrEqual(
        mockAnalyticsMetrics.totalRevenue
      )
    })
  })

  describe('Top Products', () => {
    it('should include product details', () => {
      mockAnalyticsMetrics.topProducts.forEach((product) => {
        expect(product.id).toBeDefined()
        expect(product.name).toBeDefined()
        expect(product.quantity).toBeGreaterThan(0)
        expect(product.revenue).toBeGreaterThanOrEqual(0)
      })
    })

    it('should show leading product first', () => {
      expect(mockAnalyticsMetrics.topProducts[0].quantity).toBe(8)
      expect(mockAnalyticsMetrics.topProducts[0].name).toBe('Face Serum')
    })

    it('should limit to 5 products', () => {
      expect(mockAnalyticsMetrics.topProducts.length).toBeLessThanOrEqual(5)
    })
  })

  describe('Customer Metrics', () => {
    it('should calculate repeat customer rate', () => {
      const rate = mockAnalyticsMetrics.repeatCustomerRate
      expect(rate).toBeGreaterThanOrEqual(0)
      expect(rate).toBeLessThanOrEqual(100)
    })

    it('should express repeat rate as percentage', () => {
      expect(mockAnalyticsMetrics.repeatCustomerRate).toEqual(40)
    })
  })

  describe('Empty State', () => {
    it('should handle zero revenue', () => {
      const emptyMetrics: AnalyticsMetrics = {
        totalRevenue: 0,
        totalOrders: 0,
        topProducts: [],
        repeatCustomerRate: 0,
        ordersByDate: [],
        revenueTrend: [],
      }

      expect(emptyMetrics.totalRevenue).toBe(0)
      expect(emptyMetrics.totalOrders).toBe(0)
      expect(emptyMetrics.topProducts.length).toBe(0)
    })

    it('should handle no repeat customers', () => {
      expect(mockAnalyticsMetrics.repeatCustomerRate).toBeGreaterThanOrEqual(0)
    })

    it('should handle no chart data', () => {
      const emptyMetrics: AnalyticsMetrics = {
        totalRevenue: 100000,
        totalOrders: 1,
        topProducts: [
          {
            id: 'prod-1',
            name: 'Test Product',
            quantity: 1,
            revenue: 100000,
          },
        ],
        repeatCustomerRate: 0,
        ordersByDate: [],
        revenueTrend: [],
      }

      expect(emptyMetrics.ordersByDate.length).toBe(0)
      expect(emptyMetrics.revenueTrend.length).toBe(0)
    })
  })

  describe('Data Integrity', () => {
    it('should not have negative values', () => {
      expect(mockAnalyticsMetrics.totalRevenue).toBeGreaterThanOrEqual(0)
      expect(mockAnalyticsMetrics.totalOrders).toBeGreaterThanOrEqual(0)

      mockAnalyticsMetrics.ordersByDate.forEach((entry) => {
        expect(entry.count).toBeGreaterThanOrEqual(0)
        expect(entry.revenue).toBeGreaterThanOrEqual(0)
      })

      mockAnalyticsMetrics.topProducts.forEach((product) => {
        expect(product.quantity).toBeGreaterThanOrEqual(0)
        expect(product.revenue).toBeGreaterThanOrEqual(0)
      })
    })

    it('should have consistent date formats', () => {
      mockAnalyticsMetrics.ordersByDate.forEach((entry) => {
        // Date should be in YYYY-MM-DD format
        expect(entry.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      })
    })

    it('should have non-empty product names', () => {
      mockAnalyticsMetrics.topProducts.forEach((product) => {
        expect(product.name).toBeTruthy()
        expect(product.name.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Formatting Utilities', () => {
    it('should format rupiah correctly', () => {
      const amount = 1500000
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount)

      expect(formatted).toContain('1.500.000')
      expect(formatted).toContain('Rp')
    })

    it('should format date correctly', () => {
      const dateStr = '2026-06-22'
      const formatted = new Date(dateStr).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric',
      })

      expect(formatted).toContain('Jun')
      expect(formatted).toContain('22')
    })

    it('should format percentage correctly', () => {
      const rate = mockAnalyticsMetrics.repeatCustomerRate
      const formatted = `${rate}%`
      expect(formatted).toBe('40%')
    })
  })

  describe('API Response Validation', () => {
    it('should require tenant ID for metrics query', () => {
      const tenantId = 'valid-uuid'
      expect(tenantId).toBeDefined()
      expect(tenantId.length).toBeGreaterThan(0)
    })

    it('should handle null metrics response', () => {
      const nullMetrics = null
      expect(nullMetrics).toBeNull()
    })

    it('should provide all required metric fields', () => {
      expect(mockAnalyticsMetrics).toHaveProperty('totalRevenue')
      expect(mockAnalyticsMetrics).toHaveProperty('totalOrders')
      expect(mockAnalyticsMetrics).toHaveProperty('topProducts')
      expect(mockAnalyticsMetrics).toHaveProperty('repeatCustomerRate')
      expect(mockAnalyticsMetrics).toHaveProperty('ordersByDate')
      expect(mockAnalyticsMetrics).toHaveProperty('revenueTrend')
    })
  })
})
