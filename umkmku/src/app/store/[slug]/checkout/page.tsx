'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { calculatePricingBreakdown, formatRupiah } from '@/lib/utils/pricing'
import { PriceBreakdown } from '@/components/checkout/PriceBreakdown'
import type { PricingBreakdown } from '@/lib/utils/pricing'

interface CartItem {
  product_id: string
  quantity: number
  product_name: string
  price: number
}

interface CheckoutPageProps {
  params: Promise<{ slug: string }>
}

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed'

export default function CheckoutPage({ params: paramsPromise }: CheckoutPageProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [params, setParams] = useState<{ slug: string } | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [qrisImageUrl, setQrisImageUrl] = useState<string | null>(null)
  const [pollingAttempts, setPollingAttempts] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  // Parse params
  useEffect(() => {
    paramsPromise.then((p) => setParams(p))
  }, [paramsPromise])

  // Parse cart from URL search params
  useEffect(() => {
    const cartJson = searchParams.get('cart')
    if (cartJson) {
      try {
        const parsed = JSON.parse(cartJson)
        if (Array.isArray(parsed)) {
          setCartItems(parsed)
        }
      } catch (err) {
        console.error('Failed to parse cart:', err)
        setError('Data keranjang tidak valid')
      }
    }
  }, [searchParams])

  // Calculate pricing when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const breakdown = calculatePricingBreakdown(subtotal)
      setPricing(breakdown)
    }
  }, [cartItems])

  // Poll for order status
  useEffect(() => {
    if (paymentStatus !== 'processing' || !orderId) return

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)
        if (!response.ok) throw new Error('Failed to fetch order status')

        const data = await response.json()
        const order = data.data

        // Check payment status
        if (order.payment_status === 'completed') {
          setPaymentStatus('success')
          clearInterval(interval)
          // Redirect to order confirmation page after 2 seconds
          setTimeout(() => {
            router.push(`/order/${orderId}`)
          }, 2000)
        } else if (order.payment_status === 'failed' || order.payment_status === 'expired') {
          setPaymentStatus('failed')
          setError(`Pembayaran ${order.payment_status === 'expired' ? 'kadaluarsa' : 'gagal'}`)
          clearInterval(interval)
        }

        setPollingAttempts((prev) => prev + 1)

        // Stop polling after 15 minutes (900 seconds / 3 second interval = 300 attempts)
        if (pollingAttempts > 300) {
          setPaymentStatus('failed')
          setError('Waktu pembayaran habis. Silakan coba lagi.')
          clearInterval(interval)
        }
      } catch (err) {
        console.error('Error polling order status:', err)
        // Continue polling on error
      }
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [paymentStatus, orderId, pollingAttempts, router])

  const handlePay = async () => {
    if (!params || !pricing || !customerEmail) {
      setError('Mohon lengkapi data pelanggan')
      return
    }

    setError(null)
    setPaymentStatus('processing')

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_slug: params.slug,
          items: cartItems.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity,
          })),
          customer_email: customerEmail,
          customer_name: customerName || null,
          customer_phone: customerPhone || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Gagal membuat pesanan')
      }

      const data = await response.json()
      setOrderId(data.data.order_id)
      setQrisImageUrl(data.data.qris_image_url)
    } catch (err) {
      setPaymentStatus('failed')
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    }
  }

  if (!params) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-gray-600">Keranjang belanja Anda kosong</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Kembali ke Toko
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Order Summary */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h2>

            {/* Cart Items */}
            <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200 mb-6">
              {cartItems.map((item) => (
                <div key={item.product_id} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            {pricing && <PriceBreakdown pricing={pricing} />}
          </div>

          {/* Right Column: Payment */}
          <div>
            {paymentStatus === 'idle' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Pelanggan</h2>

                <div className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nama Anda"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {/* Pay Button */}
                  <button
                    onClick={handlePay}
                    disabled={!customerEmail || paymentStatus !== 'idle'}
                    className="w-full py-3 bg-[var(--color-accent)] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                  >
                    Bayar {pricing && formatRupiah(pricing.finalPrice)}
                  </button>
                </div>
              </>
            )}

            {paymentStatus === 'processing' && (
              <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
                <div className="text-center">
                  <div className="inline-block">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]" />
                  </div>
                  <p className="mt-4 text-gray-600 font-medium">Memproses Pembayaran...</p>
                </div>

                {/* QRIS Display */}
                {qrisImageUrl && (
                  <div className="space-y-4">
                    <div className="border-t border-gray-200 pt-6">
                      <p className="text-center font-semibold text-gray-900 mb-4">
                        Scan QRIS untuk Membayar
                      </p>
                      <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
                        <img src={qrisImageUrl} alt="QRIS Code" className="w-64 h-64" />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700">
                        <strong>Catatan:</strong> Pembayaran akan dikonfirmasi setelah Anda berhasil
                        melakukan transfer. Halaman ini akan otomatis diperbarui.
                      </p>
                    </div>

                    {pricing && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-center">
                          <span className="text-gray-600">Total Pembayaran:</span>
                          <br />
                          <span className="text-2xl font-bold text-[var(--color-accent)]">
                            {formatRupiah(pricing.finalPrice)}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-700">
                        <strong>Batas waktu pembayaran:</strong> 15 menit sejak sekarang
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {paymentStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">Pembayaran Berhasil!</h3>
                <p className="text-green-700 mb-4">
                  Pesanan Anda telah dikonfirmasi. Redirecting ke halaman konfirmasi...
                </p>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Pembayaran Gagal</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setPaymentStatus('idle')
                    setOrderId(null)
                    setQrisImageUrl(null)
                    setError(null)
                  }}
                  className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
