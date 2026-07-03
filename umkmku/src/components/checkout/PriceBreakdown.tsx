'use client'

import { formatRupiah, type PricingBreakdown } from '@/lib/utils/pricing'

interface PriceBreakdownProps {
  pricing: PricingBreakdown
}

export function PriceBreakdown({ pricing }: PriceBreakdownProps) {
  return (
    <div className="space-y-3 bg-gray-50 p-6 rounded-lg border border-gray-200">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Rincian Pembayaran</h3>
      </div>

      {/* Subtotal */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Produk</span>
        <span className="font-medium text-gray-900">{formatRupiah(pricing.subtotal)}</span>
      </div>

      {/* PPN (VAT) */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>PPN (12%)</span>
        <span className="font-medium text-gray-900">{formatRupiah(pricing.ppn)}</span>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300 pt-3 mt-3" />

      {/* Subtotal with PPN */}
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">Subtotal + PPN</span>
        <span className="font-semibold text-gray-900">{formatRupiah(pricing.subtotalWithPpn)}</span>
      </div>

      {/* Gateway Fee */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Biaya Tripay (0.7%)</span>
        <span className="font-medium text-gray-900">{formatRupiah(pricing.gatewayFee)}</span>
      </div>

      {/* Final Divider */}
      <div className="border-t-2 border-gray-400 pt-3 mt-3" />

      {/* Total */}
      <div className="flex justify-between text-lg font-bold">
        <span className="text-gray-900">Total Bayar</span>
        <span className="text-[var(--color-accent)]">{formatRupiah(pricing.finalPrice)}</span>
      </div>
    </div>
  )
}
