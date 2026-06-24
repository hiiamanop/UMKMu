// Kirim WA ke merchant via Fonnte (https://fonnte.com)
// Set FONNTE_TOKEN di env untuk mengaktifkan. Jika tidak ada, skip.
export async function notifyMerchantNewOrder({
  merchantWa,
  brandName,
  customerName,
  totalAmount,
  orderId,
}: {
  merchantWa: string
  brandName: string
  customerName: string
  totalAmount: number
  orderId: string
}) {
  const token = process.env.FONNTE_TOKEN
  if (!token || !merchantWa) return

  const phone = merchantWa.replace(/\D/g, '').replace(/^0/, '62')
  const shortId = orderId.slice(-8).toUpperCase()
  const total = `Rp ${totalAmount.toLocaleString('id-ID')}`

  const message = `🛍️ *Pesanan Baru Masuk!* — ${brandName}

Pelanggan: ${customerName || 'Anonim'}
Total: ${total}
ID Pesanan: #${shortId}

Segera cek dashboard untuk verifikasi pembayaran.`

  try {
    await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ target: phone, message }),
    })
  } catch {
    // Notifikasi gagal tidak boleh gagalkan order
  }
}
