'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderTable } from './OrderTable'
// ponytail: legacy component, Order type changed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any; type OrderStatus = string

interface OrdersPageProps {
  slug: string
}

type FilterPaymentStatus = '' | 'pending' | 'processing' | 'completed' | 'failed' | 'expired'
type FilterOrderStatus = '' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export function OrdersPage({ slug }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [filterOrderStatus, setFilterOrderStatus] = useState<FilterOrderStatus>('')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<FilterPaymentStatus>('')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()
        params.set('slug', slug)
        if (filterOrderStatus) params.set('status', filterOrderStatus)
        if (filterPaymentStatus) params.set('payment_status', filterPaymentStatus)
        if (filterDateFrom) params.set('date_from', new Date(filterDateFrom).toISOString())
        if (filterDateTo) {
          const toDate = new Date(filterDateTo)
          toDate.setHours(23, 59, 59, 999)
          params.set('date_to', toDate.toISOString())
        }

        const response = await fetch(`/api/orders?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch orders')
        }

        const data = await response.json()
        setOrders(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [slug, filterOrderStatus, filterPaymentStatus, filterDateFrom, filterDateTo])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, order_status: newStatus } : order
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order')
    }
  }

  const handleResetFilters = () => {
    setFilterOrderStatus('')
    setFilterPaymentStatus('')
    setFilterDateFrom('')
    setFilterDateTo('')
  }

  const hasActiveFilters = filterOrderStatus || filterPaymentStatus || filterDateFrom || filterDateTo

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          View and manage all customer orders.
        </p>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Order Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={filterOrderStatus}
                onChange={(e) => setFilterOrderStatus(e.target.value as FilterOrderStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value as FilterPaymentStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Payments</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
              >
                Reset Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isLoading ? 'Loading Orders...' : `Orders (${orders.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OrderTable
            orders={orders}
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
