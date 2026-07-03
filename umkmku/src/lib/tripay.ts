import { createHmac, timingSafeEqual, createHash } from 'crypto'

const TRIPAY_BASE = 'https://tripay.co.id/api'

function privateKey() {
  const k = process.env.TRIPAY_PRIVATE_KEY
  if (!k) throw new Error('TRIPAY_PRIVATE_KEY not set')
  return k
}

function merchantCode() {
  const c = process.env.TRIPAY_MERCHANT_CODE
  if (!c) throw new Error('TRIPAY_MERCHANT_CODE not set')
  return c
}

export interface TripayTransactionParams {
  merchantRef: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone?: string
  items: { name: string; price: number; quantity: number }[]
  returnUrl: string
  method?: string // default: QRIS
}

export interface TripayTransaction {
  reference: string
  merchant_ref: string
  payment_url: string
  payment_method: string
  total_amount: number
  expired_time: number
  qr_string?: string
  qr_url?: string
}

export async function createTripayTransaction(params: TripayTransactionParams): Promise<TripayTransaction> {
  const code = merchantCode()
  const key = privateKey()
  const method = params.method ?? 'QRIS'

  // Signature: HMAC-SHA256(merchant_code + merchant_ref + amount, private_key)
  const signature = createHmac('sha256', key)
    .update(code + params.merchantRef + params.amount)
    .digest('hex')

  const expiredTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60 // 24 jam

  const res = await fetch(`${TRIPAY_BASE}/transaction/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      method,
      merchant_ref: params.merchantRef,
      amount: params.amount,
      customer_name: params.customerName,
      customer_email: params.customerEmail,
      customer_phone: params.customerPhone ?? '',
      order_items: params.items,
      return_url: params.returnUrl,
      expired_time: expiredTime,
      signature,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Tripay error ${res.status}: ${(err as { message?: string }).message ?? 'Unknown'}`)
  }

  const json = await res.json() as { success: boolean; message?: string; data: TripayTransaction }
  if (!json.success) throw new Error(`Tripay: ${json.message ?? 'Gagal membuat transaksi'}`)
  return json.data
}

function safeCompare(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return ha.length === hb.length && timingSafeEqual(ha, hb)
}

// Verifikasi callback dari Tripay via X-Callback-Signature header
export function verifyTripayCallback(rawBody: string, signature: string): boolean {
  try {
    const key = privateKey()
    const expected = createHmac('sha256', key).update(rawBody).digest('hex')
    return safeCompare(expected, signature)
  } catch {
    return false
  }
}
