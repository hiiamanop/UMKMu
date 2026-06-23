'use server'

import { revalidatePath } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

export async function updateBrand(slug: string, formData: FormData) {
  const brand_name = formData.get('brand_name')?.toString().trim()
  const tagline = formData.get('tagline')?.toString().trim() || null
  const description = formData.get('description')?.toString().trim() || null
  const whatsapp_number = formData.get('whatsapp_number')?.toString().trim() || null
  const instagram_url = formData.get('instagram_url')?.toString().trim() || null
  const tokopedia_url = formData.get('tokopedia_url')?.toString().trim() || null
  const shopee_url = formData.get('shopee_url')?.toString().trim() || null

  if (!brand_name || brand_name.length < 2) {
    return { error: 'Nama brand minimal 2 karakter' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('tenants')
    .update({
      brand_name,
      tagline,
      description,
      whatsapp_number,
      instagram_url,
      tokopedia_url,
      shopee_url,
    })
    .eq('slug', slug)

  if (error) return { error: 'Gagal menyimpan perubahan' }

  revalidatePath(`/store/${slug}`)
  revalidatePath(`/${slug}`)
  return { success: true }
}

export async function updateAppearance(slug: string, formData: FormData) {
  const primary_color = formData.get('primary_color')?.toString()
  const secondary_color = formData.get('secondary_color')?.toString()
  const accent_color = formData.get('accent_color')?.toString()

  const hexPattern = /^#[0-9a-fA-F]{6}$/
  if (!hexPattern.test(primary_color ?? '') ||
      !hexPattern.test(secondary_color ?? '') ||
      !hexPattern.test(accent_color ?? '')) {
    return { error: 'Format warna tidak valid' }
  }

  const supabase = createServiceClient()

  // Get tenant id for storage path
  const { data: tenant } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!tenant) return { error: 'Toko tidak ditemukan' }

  const tenantId = tenant.id
  const updates: Record<string, string> = { primary_color: primary_color!, secondary_color: secondary_color!, accent_color: accent_color! }

  // Upload helper
  async function uploadImage(field: string, key: string): Promise<string | null | { error: string }> {
    const file = formData.get(field) as File | null
    if (!file || file.size === 0) return null
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return { error: `Format gambar ${field} harus JPG, PNG, atau WebP` }
    if (file.size > 5 * 1024 * 1024)
      return { error: `Ukuran gambar ${field} maksimal 5MB` }
    const ext = file.name.split('.').pop()
    const fileName = `${tenantId}/${key}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)
    if (uploadError) return { error: `Gagal upload gambar ${field}` }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const imageFields = [
    { field: 'hero_image',    key: 'hero',          col: 'hero_image_url' },
    { field: 'about_image_1', key: 'about-1',       col: 'about_image_1_url' },
    { field: 'about_image_2', key: 'about-2',       col: 'about_image_2_url' },
    { field: 'cta_image',     key: 'cta',           col: 'cta_image_url' },
    { field: 'footer_image',  key: 'footer',        col: 'footer_image_url' },
  ]

  for (const { field, key, col } of imageFields) {
    const result = await uploadImage(field, key)
    if (result && typeof result === 'object' && 'error' in result) return result
    if (typeof result === 'string') updates[col] = result
  }

  const { error } = await supabase.from('tenants').update(updates).eq('slug', slug)

  if (error) return { error: 'Gagal menyimpan perubahan' }

  revalidatePath(`/store/${slug}`)
  revalidatePath(`/${slug}`)
  return { success: true }
}

// --- Testimonials ---

export async function saveTestimonial(slug: string, formData: FormData) {
  const id = formData.get('id')?.toString() || null
  const author_name = formData.get('author_name')?.toString().trim()
  const author_title = formData.get('author_title')?.toString().trim() || null
  const quote = formData.get('quote')?.toString().trim()

  if (!author_name || !quote) return { error: 'Nama dan kutipan wajib diisi' }

  const supabase = createServiceClient()
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single()
  if (!tenant) return { error: 'Toko tidak ditemukan' }

  const payload: Record<string, unknown> = { author_name, author_title, quote, tenant_id: tenant.id }

  for (const [field, key] of [['image_1', 'testimonial-img1'], ['image_2', 'testimonial-img2']] as const) {
    const file = formData.get(field) as File | null
    if (file && file.size > 0) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        return { error: 'Format gambar harus JPG, PNG, atau WebP' }
      const ext = file.name.split('.').pop()
      const fileName = `${tenant.id}/${key}-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })
      if (uploadError) return { error: 'Gagal upload gambar testimonial' }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      payload[`${field}_url`] = urlData.publicUrl
    }
  }

  if (id) {
    const { error } = await supabase.from('testimonials').update(payload).eq('id', id).eq('tenant_id', tenant.id)
    if (error) return { error: 'Gagal menyimpan testimonial' }
  } else {
    const { error } = await supabase.from('testimonials').insert(payload)
    if (error) return { error: 'Gagal menambah testimonial' }
  }

  revalidatePath(`/store/${slug}`)
  revalidatePath(`/${slug}`)
  return { success: true }
}

export async function deleteTestimonial(slug: string, id: string) {
  const supabase = createServiceClient()
  const { data: tenant } = await supabase.from('tenants').select('id').eq('slug', slug).single()
  if (!tenant) return { error: 'Toko tidak ditemukan' }
  const { error } = await supabase.from('testimonials').delete().eq('id', id).eq('tenant_id', tenant.id)
  if (error) return { error: 'Gagal menghapus testimonial' }
  revalidatePath(`/store/${slug}`)
  return { success: true }
}

export async function updateChatbot(slug: string, formData: FormData) {
  const chatbot_name = formData.get('chatbot_name')?.toString().trim()
  const chatbot_persona = formData.get('chatbot_persona')?.toString().trim() || null

  if (!chatbot_name || chatbot_name.length < 2) {
    return { error: 'Nama chatbot minimal 2 karakter' }
  }

  const supabase = createServiceClient()

  const { error } = await supabase
    .from('tenants')
    .update({ chatbot_name, chatbot_persona })
    .eq('slug', slug)

  if (error) return { error: 'Gagal menyimpan pengaturan chatbot' }

  revalidatePath(`/store/${slug}`)
  revalidatePath(`/${slug}`)
  return { success: true }
}
