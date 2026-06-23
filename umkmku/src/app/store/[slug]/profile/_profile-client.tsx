'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Heart, ShoppingBag, Settings, Leaf, Package } from 'lucide-react'
import type { Tenant, Product } from '@/lib/supabase/types'

// ── Hardcoded demo data (phase 2: replace with real auth + DB) ──
const DEMO_USER = {
  name: 'Elara Vance',
  email: 'elara@example.com',
  memberSince: '2022',
  points: 1240,
  tier: 'Purity Tier',
  skin: { type: 'Kombinasi', concern: 'Hidrasi', sensitivity: 'Sedang' },
}

const DEMO_ORDERS = [
  { id: '#NE-2024-001', date: '12 Jun 2025', items: 'Botanical Face Oil, Morning Dew Mist', total: 'Rp 384.000', status: 'Terkirim' },
  { id: '#NE-2024-002', date: '28 Mei 2025', items: 'Velvet Clay Mask', total: 'Rp 192.000', status: 'Terkirim' },
  { id: '#NE-2024-003', date: '3 Apr 2025', items: 'Eternal Bloom Oil, Velvet Clay Mask', total: 'Rp 310.000', status: 'Terkirim' },
]

const DEMO_WISHLIST = [
  { name: 'Botanical Face Oil', price: 'Rp 198.000' },
  { name: 'Morning Dew Mist', price: 'Rp 145.000' },
  { name: 'Velvet Clay Mask', price: 'Rp 192.000' },
]

const TABS = [
  { id: 'profile', label: 'Detail Profil', icon: User },
  { id: 'skin', label: 'Preferensi Kulit', icon: Leaf },
  { id: 'orders', label: 'Riwayat Pesanan', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'settings', label: 'Pengaturan Akun', icon: Settings },
]

interface Props {
  tenant: Tenant
  products: Product[]
  slug: string
}

function formatPrice(p: number | null) {
  if (!p) return '-'
  return 'Rp ' + p.toLocaleString('id-ID')
}

export function ProfileClient({ tenant, products, slug }: Props) {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="min-h-screen bg-[var(--color-secondary)]">

      {/* Header */}
      <div className="bg-[var(--color-primary)] px-6 md:px-16 py-16">
        <div className="max-w-[1280px] mx-auto">
          <p className="text-label-caps text-white/50 mb-3">AKUN SAYA</p>
          <h1 className="text-display text-white mb-2">
            Selamat datang, <i className="italic">{DEMO_USER.name.split(' ')[0]}</i>
          </h1>
          <p className="text-body-md text-white/60">
            Merawat perjalanan kecantikanmu sejak {DEMO_USER.memberSince}.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-6 md:px-16 py-16">
        <div className="flex gap-12">

          {/* Sidebar */}
          <aside className="w-56 shrink-0">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-8 pb-8 border-b border-black/10">
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mb-4">
                <span className="text-display text-[var(--color-primary)] text-2xl font-serif italic">
                  {DEMO_USER.name.charAt(0)}
                </span>
              </div>
              <p className="text-headline-md italic text-center leading-tight">{DEMO_USER.name}</p>
              <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mt-1">{DEMO_USER.tier}</p>
            </div>

            {/* Nav */}
            <nav className="flex flex-col gap-0.5">
              {TABS.map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-3 py-3 text-left transition-all rounded-sm text-xs tracking-widest uppercase font-sans ${
                      active
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'text-[var(--color-accent)]/50 hover:text-[var(--color-accent)] hover:bg-black/5'
                    }`}
                  >
                    <Icon size={13} />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">

            {/* ── PROFIL ── */}
            {activeTab === 'profile' && (
              <div className="space-y-8">

                {/* Account overview */}
                <div className="bg-white border border-black/8 rounded p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-2">INFORMASI AKUN</p>
                      <h2 className="text-headline-lg italic">{DEMO_USER.name}</h2>
                      <p className="text-body-md text-[var(--color-accent)]/60 mt-1">{DEMO_USER.email}</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="text-label-caps text-[10px] border border-black/15 px-4 py-2 hover:bg-[var(--color-secondary)] transition-colors">
                        Edit Profil
                      </button>
                      <button className="text-label-caps text-[10px] border border-black/15 px-4 py-2 hover:bg-[var(--color-secondary)] transition-colors">
                        Ubah Password
                      </button>
                    </div>
                  </div>

                  {/* Essence Circle */}
                  <div className="border-t border-black/8 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-label-caps text-[10px] text-[var(--color-primary)] mb-1">ESSENCE CIRCLE</p>
                        <div className="flex items-baseline gap-3">
                          <span className="text-display text-[var(--color-primary)] text-4xl italic">{DEMO_USER.points.toLocaleString('id-ID')}</span>
                          <span className="text-body-md text-[var(--color-accent)]/50">poin total</span>
                        </div>
                        <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mt-1">{DEMO_USER.tier}</p>
                      </div>
                      <div className="text-right">
                        <div className="w-32 h-1.5 bg-black/10 rounded-full mb-2">
                          <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: '62%' }} />
                        </div>
                        <p className="text-[10px] text-[var(--color-accent)]/40 font-sans">760 poin lagi ke tier berikutnya</p>
                        <button className="text-label-caps text-[10px] text-[var(--color-primary)] mt-2 hover:opacity-70 transition-opacity">
                          Lihat Rewards →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skin profile */}
                <div className="bg-white border border-black/8 rounded p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">PROFIL KULIT</p>
                      <h3 className="text-headline-md italic">Tipe kulitmu</h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('skin')}
                      className="text-label-caps text-[10px] text-[var(--color-primary)] hover:opacity-70 transition-opacity"
                    >
                      Ikuti Kuis Lagi →
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Tipe', value: DEMO_USER.skin.type },
                      { label: 'Concern', value: DEMO_USER.skin.concern },
                      { label: 'Sensitivitas', value: DEMO_USER.skin.sensitivity },
                    ].map(item => (
                      <div key={item.label} className="border border-black/8 rounded p-4 text-center">
                        <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-2">{item.label.toUpperCase()}</p>
                        <p className="text-headline-md italic">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent orders */}
                <div className="bg-white border border-black/8 rounded p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">PERJALANAN TERAKHIR</p>
                      <h3 className="text-headline-md italic">Pesanan terbaru</h3>
                    </div>
                    <button onClick={() => setActiveTab('orders')} className="text-label-caps text-[10px] text-[var(--color-primary)] hover:opacity-70">
                      Lihat Semua →
                    </button>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-black/8">
                        {['Pesanan', 'Tanggal', 'Item', 'Total', 'Status'].map(h => (
                          <th key={h} className="text-left text-label-caps text-[10px] text-[var(--color-accent)]/40 pb-3 pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DEMO_ORDERS.map(order => (
                        <tr key={order.id} className="border-b border-black/5 last:border-0">
                          <td className="py-4 pr-4 font-mono text-xs text-[var(--color-primary)]">{order.id}</td>
                          <td className="py-4 pr-4 text-body-md text-[var(--color-accent)]/60">{order.date}</td>
                          <td className="py-4 pr-4 text-body-md">{order.items}</td>
                          <td className="py-4 pr-4 text-body-md font-medium">{order.total}</td>
                          <td className="py-4">
                            <span className="text-label-caps text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1">
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Product recommendations */}
                {products.length > 0 && (
                  <div>
                    <div className="mb-6">
                      <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">UNTUK KAMU</p>
                      <h3 className="text-headline-md italic">Rekomendasi produk</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      {products.map(p => (
                        <Link key={p.id} href={`/store/${slug}/products/${p.id}`}
                          className="group bg-white border border-black/8 rounded overflow-hidden hover:border-[var(--color-primary)]/30 transition-colors">
                          <div className="relative aspect-square bg-[var(--color-secondary)]">
                            {p.image_url && (
                              <Image src={p.image_url} alt={p.name} fill sizes="33vw" className="object-cover" />
                            )}
                          </div>
                          <div className="p-4">
                            <p className="text-body-md font-medium leading-tight mb-1 group-hover:text-[var(--color-primary)] transition-colors">{p.name}</p>
                            <p className="text-label-caps text-[10px] text-[var(--color-accent)]/50">{formatPrice(p.price)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── KULIT ── */}
            {activeTab === 'skin' && (
              <div className="bg-white border border-black/8 rounded p-8">
                <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">PREFERENSI KULIT</p>
                <h2 className="text-headline-lg italic mb-8">Profil kulitmu</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { label: 'Tipe Kulit', value: DEMO_USER.skin.type, options: ['Normal', 'Kering', 'Berminyak', 'Kombinasi', 'Sensitif'] },
                    { label: 'Concern Utama', value: DEMO_USER.skin.concern, options: ['Jerawat', 'Pencerah', 'Anti-aging', 'Hidrasi', 'Pori-pori'] },
                    { label: 'Tingkat Sensitivitas', value: DEMO_USER.skin.sensitivity, options: ['Rendah', 'Sedang', 'Tinggi'] },
                  ].map(item => (
                    <div key={item.label} className="border border-black/8 rounded p-5">
                      <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-3">{item.label.toUpperCase()}</p>
                      <p className="text-headline-md italic mb-4">{item.value}</p>
                      <div className="flex flex-wrap gap-2">
                        {item.options.map(opt => (
                          <span key={opt}
                            className={`text-label-caps text-[10px] px-2 py-1 border cursor-pointer transition-colors ${
                              opt === item.value
                                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                                : 'border-black/15 text-[var(--color-accent)]/50 hover:border-[var(--color-primary)]/40'
                            }`}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="bg-[var(--color-primary)] text-white text-label-caps tracking-widest px-8 py-3 hover:opacity-90 transition-opacity">
                  Simpan Preferensi
                </button>
              </div>
            )}

            {/* ── PESANAN ── */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-black/8 rounded p-8">
                <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">RIWAYAT</p>
                <h2 className="text-headline-lg italic mb-8">Semua pesanan</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/8">
                      {['Pesanan', 'Tanggal', 'Item', 'Total', 'Status', ''].map((h, i) => (
                        <th key={i} className="text-left text-label-caps text-[10px] text-[var(--color-accent)]/40 pb-4 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DEMO_ORDERS.map(order => (
                      <tr key={order.id} className="border-b border-black/5 last:border-0">
                        <td className="py-5 pr-4 font-mono text-xs text-[var(--color-primary)]">{order.id}</td>
                        <td className="py-5 pr-4 text-body-md text-[var(--color-accent)]/60">{order.date}</td>
                        <td className="py-5 pr-4 text-body-md">{order.items}</td>
                        <td className="py-5 pr-4 text-body-md font-medium">{order.total}</td>
                        <td className="py-5 pr-4">
                          <span className="text-label-caps text-[10px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1">{order.status}</span>
                        </td>
                        <td className="py-5">
                          <button className="text-label-caps text-[10px] text-[var(--color-accent)]/40 hover:text-[var(--color-primary)] transition-colors">
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── WISHLIST ── */}
            {activeTab === 'wishlist' && (
              <div className="bg-white border border-black/8 rounded p-8">
                <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">TERSIMPAN</p>
                <h2 className="text-headline-lg italic mb-8">Wishlist kamu</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(products.length > 0 ? products : DEMO_WISHLIST.map(w => ({ id: w.name, name: w.name, price: 0, image_url: null } as unknown as Product))).map((p, i) => (
                    <div key={i} className="border border-black/8 rounded overflow-hidden group">
                      <div className="relative aspect-square bg-[var(--color-secondary)]">
                        {'image_url' in p && p.image_url && (
                          <Image src={p.image_url} alt={p.name} fill sizes="33vw" className="object-cover" />
                        )}
                      </div>
                      <div className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-body-md font-medium">{p.name}</p>
                          <p className="text-label-caps text-[10px] text-[var(--color-accent)]/50">
                            {'price' in p ? formatPrice(p.price) : ''}
                          </p>
                        </div>
                        <button className="text-label-caps text-[10px] bg-[var(--color-primary)] text-white px-3 py-1.5 hover:opacity-90 transition-opacity">
                          Tambah
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SETTINGS ── */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="bg-white border border-black/8 rounded p-8">
                  <p className="text-label-caps text-[10px] text-[var(--color-accent)]/40 mb-1">PENGATURAN</p>
                  <h2 className="text-headline-lg italic mb-8">Pengaturan akun</h2>
                  <div className="space-y-6 max-w-md">
                    {[
                      { label: 'Nama Lengkap', value: DEMO_USER.name },
                      { label: 'Email', value: DEMO_USER.email },
                      { label: 'Nomor Telepon', value: '+62 812 0000 0000' },
                    ].map(f => (
                      <div key={f.label}>
                        <label className="text-label-caps text-[10px] text-[var(--color-accent)]/40 block mb-2">{f.label.toUpperCase()}</label>
                        <input defaultValue={f.value}
                          className="w-full bg-[var(--color-secondary)] border border-black/15 px-4 py-3 text-body-md focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                      </div>
                    ))}
                    <button className="bg-[var(--color-primary)] text-white text-label-caps tracking-widest px-8 py-3 hover:opacity-90 transition-opacity">
                      Simpan Perubahan
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-black/8 rounded p-8">
                  <h3 className="text-headline-md italic mb-6">Preferensi Notifikasi</h3>
                  <div className="space-y-4">
                    {['Email promosi dan penawaran', 'Update pesanan via email', 'Rekomendasi produk mingguan'].map(item => (
                      <label key={item} className="flex items-center justify-between cursor-pointer">
                        <span className="text-body-md">{item}</span>
                        <div className="w-10 h-5 bg-[var(--color-primary)] rounded-full relative">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  )
}
