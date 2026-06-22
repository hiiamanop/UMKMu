'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">
          View and manage all customer orders.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-2">No orders yet</p>
            <p className="text-sm text-muted-foreground">
              Orders will appear here as customers make purchases.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
