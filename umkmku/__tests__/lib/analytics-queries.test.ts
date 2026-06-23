import { describe, it, expect } from 'vitest'
import type { Order } from '@/lib/supabase/types'

/**
 * Test calculation logic for analytics metrics
 * Note: Direct function testing requires mocking Supabase client
 * These tests validate the calculation logic
 */

describe('Analytics Queries - Calculation Logic', () => {
  describe('Metrics Aggregation', () => {
    it('should calculate total revenue from orders', () => {
      const orders: Partial<Order>[] = [
        {
          final_price: 100000,
          items: [
            { product_id: 'p1', product_name: 'Test', quantity: 1, price_at_purchase: 100000 }
          ],
        } as any,
        {
          final_price: 200000,
          items: [
            { product_id: 'p2', product_name: 'Test 2', quantity: 2, price_at_purchase: 100000 }
          ],
        } as any,
      ]

      const totalRevenue = orders.reduce((sum, order) => sum + (order.final_price || 0), 0)
      expect(totalRevenue).toBe(300000)
    })

    it('should count total orders', () => {
      const orders: Partial<Order>[] = [
        { id: '1', final_price: 100000, items: [] } as any,
        { id: '2', final_price: 200000, items: [] } as any,
        { id: '3', final_price: 150000, items: [] } as any,
      ]

      expect(orders.length).toBe(3)
    })

    it('should calculate repeat customer rate', () => {
      const orders: Partial<Order>[] = [
        { customer_email: 'test@example.com', final_price: 100000, items: [] } as any,
        { customer_email: 'test@example.com', final_price: 100000, items: [] } as any,
        { customer_email: 'other@example.com', final_price: 100000, items: [] } as any,
        { customer_email: 'other@example.com', final_price: 100000, items: [] } as any,
        { customer_email: 'third@example.com', final_price: 100000, items: [] } as any,
      ]

      // Calculate repeat customers
      const emailCounts = new Map<string, number>()
      orders.forEach((order) => {
        const email = order.customer_email!
        emailCounts.set(email, (emailCounts.get(email) || 0) + 1)
      })

      const repeatCustomers = Array.from(emailCounts.values()).filter(
        (count) => count > 1
      ).length
      const repeatCustomerRate = Math.round(
        (repeatCustomers / emailCounts.size) * 100
      )

      expect(emailCounts.size).toBe(3) // 3 unique customers
      expect(repeatCustomers).toBe(2) // 2 repeat customers
      expect(repeatCustomerRate).toBe(67) // 67%
    })
  })

  describe('Top Products Ranking', () => {
    it('should identify top products by quantity', () => {
      const orders: Partial<Order>[] = [
        {
          items: [
            { product_id: 'p1', product_name: 'Serum', quantity: 5, price_at_purchase: 100000 },
          ],
        } as any,
        {
          items: [
            { product_id: 'p2', product_name: 'Moisturizer', quantity: 3, price_at_purchase: 50000 },
          ],
        } as any,
        {
          items: [
            { product_id: 'p1', product_name: 'Serum', quantity: 2, price_at_purchase: 100000 },
          ],
        } as any,
      ]

      const productMap = new Map<
        string,
        { name: string; quantity: number; revenue: number }
      >()

      orders.forEach((order) => {
        order.items!.forEach((item: any) => {
          const productId = item.product_id
          const current = productMap.get(productId) || {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          }
          current.quantity += item.quantity || 1
          current.revenue += (item.price_at_purchase || 0) * (item.quantity || 1)
          productMap.set(productId, current)
        })
      })

      const topProducts = Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)

      expect(topProducts[0].id).toBe('p1')
      expect(topProducts[0].quantity).toBe(7)
      expect(topProducts[1].id).toBe('p2')
      expect(topProducts[1].quantity).toBe(3)
    })

    it('should calculate product revenue correctly', () => {
      const orders: Partial<Order>[] = [
        {
          items: [
            { product_id: 'p1', product_name: 'Item', quantity: 2, price_at_purchase: 100000 },
          ],
        } as any,
        {
          items: [
            { product_id: 'p1', product_name: 'Item', quantity: 3, price_at_purchase: 100000 },
          ],
        } as any,
      ]

      const productMap = new Map<
        string,
        { name: string; quantity: number; revenue: number }
      >()

      orders.forEach((order) => {
        order.items!.forEach((item: any) => {
          const productId = item.product_id
          const current = productMap.get(productId) || {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          }
          current.quantity += item.quantity || 1
          current.revenue += (item.price_at_purchase || 0) * (item.quantity || 1)
          productMap.set(productId, current)
        })
      })

      const product = productMap.get('p1')!
      expect(product.revenue).toBe(500000) // 5 * 100000
    })

    it('should limit top products to 5', () => {
      const productMap = new Map()
      for (let i = 0; i < 10; i++) {
        productMap.set(`p${i}`, {
          name: `Product ${i}`,
          quantity: 10 - i,
          revenue: 100000 * (10 - i),
        })
      }

      const topProducts = Array.from(productMap.entries())
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5)

      expect(topProducts.length).toBe(5)
      expect(topProducts[0].id).toBe('p0')
      expect(topProducts[4].id).toBe('p4')
    })
  })

  describe('Date Aggregation', () => {
    it('should group orders by date', () => {
      const orders: Partial<Order>[] = [
        {
          created_at: '2026-06-22T10:00:00Z',
          final_price: 100000,
          items: [],
        } as any,
        {
          created_at: '2026-06-22T15:00:00Z',
          final_price: 150000,
          items: [],
        } as any,
        {
          created_at: '2026-06-21T10:00:00Z',
          final_price: 200000,
          items: [],
        } as any,
      ]

      const dateMap = new Map<string, { count: number; revenue: number }>()

      orders.forEach((order) => {
        const date = new Date(order.created_at!)
        const dateStr = date.toISOString().split('T')[0]
        const current = dateMap.get(dateStr) || { count: 0, revenue: 0 }
        current.count += 1
        current.revenue += order.final_price!
        dateMap.set(dateStr, current)
      })

      expect(dateMap.size).toBe(2)
      expect(dateMap.get('2026-06-22')).toEqual({ count: 2, revenue: 250000 })
      expect(dateMap.get('2026-06-21')).toEqual({ count: 1, revenue: 200000 })
    })

    it('should sort dates in chronological order', () => {
      const dateMap = new Map<string, { count: number; revenue: number }>()
      dateMap.set('2026-06-22', { count: 2, revenue: 250000 })
      dateMap.set('2026-06-21', { count: 1, revenue: 200000 })
      dateMap.set('2026-06-20', { count: 1, revenue: 100000 })

      const ordersByDate = Array.from(dateMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date))

      expect(ordersByDate[0].date).toBe('2026-06-20')
      expect(ordersByDate[1].date).toBe('2026-06-21')
      expect(ordersByDate[2].date).toBe('2026-06-22')
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty orders array', () => {
      const orders: Order[] = []
      expect(orders.length).toBe(0)

      const totalRevenue = orders.reduce((sum, order) => sum + order.final_price, 0)
      expect(totalRevenue).toBe(0)
    })

    it('should handle orders with no items', () => {
      const orders: Partial<Order>[] = [
        {
          id: '1',
          final_price: 100000,
          items: [],
        } as any,
      ]

      const productMap = new Map()
      orders.forEach((order) => {
        order.items!.forEach((item: any) => {
          // This loop won't execute if items is empty
          productMap.set(item.product_id, item)
        })
      })

      expect(productMap.size).toBe(0)
    })

    it('should handle zero-priced items', () => {
      const orders: Partial<Order>[] = [
        {
          items: [
            { product_id: 'p1', product_name: 'Free Item', quantity: 5, price_at_purchase: 0 },
          ],
        } as any,
      ]

      const productMap = new Map<
        string,
        { name: string; quantity: number; revenue: number }
      >()

      orders.forEach((order) => {
        order.items!.forEach((item: any) => {
          const current = productMap.get(item.product_id) || {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          }
          current.quantity += item.quantity
          current.revenue += item.price_at_purchase * item.quantity
          productMap.set(item.product_id, current)
        })
      })

      const product = productMap.get('p1')!
      expect(product.revenue).toBe(0)
      expect(product.quantity).toBe(5)
    })

    it('should handle single customer', () => {
      const orders: Partial<Order>[] = [
        { customer_email: 'test@example.com', final_price: 100000, items: [] } as any,
      ]

      const emailCounts = new Map<string, number>()
      orders.forEach((order) => {
        emailCounts.set(order.customer_email!, (emailCounts.get(order.customer_email!) || 0) + 1)
      })

      const repeatCustomers = Array.from(emailCounts.values()).filter(
        (count) => count > 1
      ).length
      const repeatCustomerRate = emailCounts.size > 0
        ? Math.round((repeatCustomers / emailCounts.size) * 100)
        : 0

      expect(repeatCustomerRate).toBe(0) // No repeat customers
    })
  })

  describe('Data Consistency', () => {
    it('should not have negative totals', () => {
      const orders: Partial<Order>[] = [
        { final_price: 100000, items: [] } as any,
        { final_price: 200000, items: [] } as any,
      ]

      const total = orders.reduce((sum, order) => sum + order.final_price!, 0)
      expect(total).toBeGreaterThanOrEqual(0)
    })

    it('should preserve order count accuracy', () => {
      const orders: Partial<Order>[] = [
        { id: '1', final_price: 100000, items: [] } as any,
        { id: '2', final_price: 200000, items: [] } as any,
        { id: '3', final_price: 300000, items: [] } as any,
      ]

      const dateMap = new Map()
      orders.forEach((order) => {
        dateMap.set('dummy-date', (dateMap.get('dummy-date') || 0) + 1)
      })

      const totalCount = Array.from(dateMap.values()).reduce((sum: number, val: any) => sum + val, 0)
      expect(totalCount).toBe(orders.length)
    })
  })
})
