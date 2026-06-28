/**
 * Pricing utilities for Indonesian VAT (PPN) and Xendit fee calculation
 *
 * Formula:
 * - PPN (Pajak Pertambahan Nilai / VAT) = 12% on subtotal
 * - Subtotal with PPN = subtotal + PPN
 * - Xendit fee = 2.5% on subtotal with PPN
 * - Final price = subtotal with PPN + Xendit fee
 */

export interface PricingBreakdown {
  subtotal: number
  ppn: number
  subtotalWithPpn: number
  xenditFee: number
  finalPrice: number
}

/**
 * Calculate complete pricing breakdown including PPN and Xendit fee
 *
 * @param subtotal - Base product total in Rupiah (IDR)
 * @returns PricingBreakdown object with all pricing fields
 *
 * Example:
 * calculatePricingBreakdown(100000)
 * => { subtotal: 100000, ppn: 12000, subtotalWithPpn: 112000, xenditFee: 2800, finalPrice: 114800 }
 */
export function calculatePricingBreakdown(subtotal: number, includeGatewayFee = true): PricingBreakdown {
  const ppn = Math.round(subtotal * 0.12)
  const subtotalWithPpn = subtotal + ppn
  const xenditFee = includeGatewayFee ? Math.round(subtotalWithPpn * 0.025) : 0
  const finalPrice = subtotalWithPpn + xenditFee

  return { subtotal, ppn, subtotalWithPpn, xenditFee, finalPrice }
}

/**
 * Format amount to Indonesian Rupiah (IDR) currency string
 *
 * @param amount - Amount in Rupiah
 * @returns Formatted string like "Rp 100.000"
 *
 * Example:
 * formatRupiah(100000) => "Rp 100.000"
 * formatRupiah(1234567) => "Rp 1.234.567"
 */
export function formatRupiah(amount: number): string {
  // Format number with thousands separator (dot in Indonesian locale)
  const formatted = Math.floor(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return `Rp ${formatted}`
}

/**
 * Parse Indonesian Rupiah currency string back to number
 *
 * @param rupiah - Formatted Rupiah string like "Rp 100.000"
 * @returns Number in Rupiah, or 0 if invalid input
 *
 * Example:
 * parseRupiah("Rp 100.000") => 100000
 * parseRupiah("Rp 1.234.567") => 1234567
 * parseRupiah("invalid") => 0
 */
export function parseRupiah(rupiah: string): number {
  // Remove "Rp", spaces, and thousand separators (dots)
  const cleaned = rupiah.replace(/[^\d]/g, '')

  // Return parsed number or 0 if empty
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}
