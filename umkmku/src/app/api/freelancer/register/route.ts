import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const auth = await createClient()
    const { data: { user } } = await auth.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name, email, bio, portfolio_url } = await request.json()

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: 'Nama dan email wajib diisi.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { error } = await supabase.from('freelancers').insert({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      bio: bio?.trim() || null,
      portfolio_url: portfolio_url?.trim() || null,
      user_id: user.id,
    })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Email ini sudah terdaftar.' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Freelancer register error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
