export interface PricingBreakdown {
  subtotal: number
  ppn: number
  subtotalWithPpn: number
  gatewayFee: number
  finalPrice: number
}

// Tripay QRIS fee: 0.7%
const TRIPAY_QRIS_FEE_RATE = 0.007

export function calculatePricingBreakdown(subtotal: number, includeGatewayFee = true): PricingBreakdown {
  const ppn = Math.round(subtotal * 0.12)
  const subtotalWithPpn = subtotal + ppn
  const gatewayFee = includeGatewayFee ? Math.round(subtotalWithPpn * TRIPAY_QRIS_FEE_RATE) : 0
  const finalPrice = subtotalWithPpn + gatewayFee

  return { subtotal, ppn, subtotalWithPpn, gatewayFee, finalPrice }
}

export function formatRupiah(amount: number): string {
  const formatted = Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${formatted}`
}

export function parseRupiah(rupiah: string): number {
  const cleaned = rupiah.replace(/[^\d]/g, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}
