'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, TrendingUp, Package } from 'lucide-react'

interface OverviewPageProps {
  tenantSlug?: string
}

export function OverviewPage({ tenantSlug }: OverviewPageProps) {
  // Placeholder data - real data will come from API in Task 11
  const stats = {
    totalOrders: 24,
    totalRevenue: 2850000,
    topProducts: [
      { id: 1, name: 'Hydrating Serum', quantity: 12 },
      { id: 2, name: 'Face Wash', quantity: 8 },
      { id: 3, name: 'Moisturizer', quantity: 6 },
      { id: 4, name: 'Toner', quantity: 4 },
      { id: 5, name: 'Sunscreen', quantity: 3 },
    ],
    recentOrders: [
      {
        id: 'ORD-001',
        customer: 'Budi Santoso',
        date: '2026-06-22',
        total: 250000,
        status: 'completed',
      },
      {
        id: 'ORD-002',
        customer: 'Siti Nurhaliza',
        date: '2026-06-21',
        total: 450000,
        status: 'processing',
      },
      {
        id: 'ORD-003',
        customer: 'Rina Wijaya',
        date: '2026-06-20',
        total: 325000,
        status: 'completed',
      },
      {
        id: 'ORD-004',
        customer: 'Dharma Putra',
        date: '2026-06-19',
        total: 175000,
        status: 'pending',
      },
      {
        id: 'ORD-005',
        customer: 'Eka Sutrisno',
        date: '2026-06-18',
        total: 675000,
        status: 'completed',
      },
    ],
  }

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to your store dashboard. Here's your sales overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <ShoppingCart className="w-8 h-8 text-blue-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {formatRupiah(stats.totalRevenue)}
              </div>
              <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products Sold (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {stats.topProducts.reduce((sum, p) => sum + p.quantity, 0)}
              </div>
              <Package className="w-8 h-8 text-purple-500 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{product.name}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {product.quantity} sold
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="font-medium text-sm">{formatRupiah(order.total)}</p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
