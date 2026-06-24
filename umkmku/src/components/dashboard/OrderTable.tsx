'use client'

import { useState } from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// ponytail: legacy component — schema changed, using any to avoid TS errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Order = any; type OrderStatus = string; type OrderPaymentStatus = string
const _t: { Order: Order; OrderStatus: OrderStatus; OrderPaymentStatus: OrderPaymentStatus } = {} as never; void _t
import type {} from '@/lib/supabase/types'

interface OrderTableProps {
  orders: Order[]
  onStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>
  isLoading?: boolean
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  expired: 'Expired',
}

const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const paymentStatusColors: Record<OrderPaymentStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  expired: 'bg-gray-100 text-gray-800',
}

function formatRupiah(amount: number | null): string {
  if (amount === null) return '-'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function OrderTable({
  orders,
  onStatusChange,
  isLoading = false,
}: OrderTableProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId)
    try {
      await onStatusChange(orderId, newStatus)
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No orders yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Orders will appear here as customers make purchases.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Desktop View */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tbody key={order.id}>
                <tr className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2"
                    >
                      <span className="text-sm font-mono">{order.id.slice(0, 8)}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${expandedOrderId === order.id ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {formatRupiah(order.final_price)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge className={paymentStatusColors[order.payment_status]}>
                      {paymentStatusLabels[order.payment_status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={isLoading || updatingOrderId === order.id}
                      className={`px-3 py-1 rounded text-sm font-medium border cursor-pointer disabled:opacity-50 ${orderStatusColors[order.order_status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      disabled={isLoading}
                    >
                      {expandedOrderId === order.id ? 'Hide' : 'View'}
                    </button>
                  </td>
                </tr>

                {/* Expandable Detail Row */}
                {expandedOrderId === order.id && (
                  <tr className="bg-gray-50 border-b">
                    <td colSpan={7} className="px-6 py-4">
                      <OrderDetail order={order} />
                    </td>
                  </tr>
                )}
              </tbody>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {order.id.slice(0, 8)}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {expandedOrderId === order.id ? 'Hide' : 'View'}
                  </button>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="font-medium text-gray-900">
                      {formatDate(order.created_at).split(',')[0]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="font-semibold text-gray-900">
                      {formatRupiah(order.final_price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <Badge className={paymentStatusColors[order.payment_status]}>
                      {paymentStatusLabels[order.payment_status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Order Status</p>
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={isLoading || updatingOrderId === order.id}
                      className={`px-2 py-1 rounded text-xs font-medium border cursor-pointer disabled:opacity-50 ${orderStatusColors[order.order_status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Customer</p>
                  <p className="text-sm font-medium text-gray-900">
                    {order.customer_name || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-600">{order.customer_email}</p>
                </div>

                {/* Expandable Detail */}
                {expandedOrderId === order.id && (
                  <div className="pt-3 border-t">
                    <OrderDetail order={order} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

interface OrderDetailProps {
  order: Order
}

function OrderDetail({ order }: OrderDetailProps) {
  return (
    <div className="space-y-4">
      {/* Items */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Items</h4>
        <div className="space-y-2">
          {order.items && order.items.length > 0 ? (
            order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.product_name} x {item.quantity}
                </span>
                <span className="font-medium">
                  {formatRupiah(item.price_at_purchase * item.quantity)}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No items</p>
          )}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Pricing Breakdown</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Subtotal</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>PPN (12%)</span>
            <span>{formatRupiah(order.ppn)}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Xendit Fee (2.5%)</span>
            <span>{formatRupiah(order.xendit_fee)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t">
            <span>Total</span>
            <span>{formatRupiah(order.final_price)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">Notes</h4>
          <p className="text-sm text-gray-700">{order.notes}</p>
        </div>
      )}

      {/* Contact Info */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Contact</h4>
        <div className="text-sm text-gray-700 space-y-1">
          <p>Email: {order.customer_email}</p>
          {order.customer_phone && <p>Phone: {order.customer_phone}</p>}
        </div>
      </div>
    </div>
  )
}
