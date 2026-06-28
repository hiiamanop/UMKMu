import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, summary, status, image_url, created_at, published_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data })
}

export async function PATCH(req: NextRequest) {
  const { id, status, image_url } = await req.json()
  const supabase = createServiceClient()

  const updates: Record<string, unknown> = { status }
  if (image_url) updates.image_url = image_url
  if (status === 'published') updates.published_at = new Date().toISOString()
  if (status === 'draft') updates.published_at = null

  const { data, error } = await supabase
    .from('articles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ article: data })
}
