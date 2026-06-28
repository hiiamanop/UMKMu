import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendTelegramMessage } from '@/lib/notifications/telegram'

const RSS_URL = 'https://news.google.com/rss/search?q=UMKM+Indonesia&hl=id&gl=ID&ceid=ID:id'

function parseRSS(xml: string): { title: string; link: string; description: string }[] {
  const items: { title: string; link: string; description: string }[] = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
    const block = match[1]
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
      ?? block.match(/<title>(.*?)<\/title>/)?.[1] ?? ''
    const link = block.match(/<link>(.*?)<\/link>/)?.[1]
      ?? block.match(/<guid>(.*?)<\/guid>/)?.[1] ?? ''
    const description = block.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
      ?? block.match(/<description>(.*?)<\/description>/)?.[1] ?? ''
    if (title) items.push({ title: title.trim(), link: link.trim(), description: description.replace(/<[^>]+>/g, '').trim() })
  }
  return items
}

function slugify(text: string): string {
  return text.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
    + '-' + Date.now()
}

async function generateWithAI(newsItems: { title: string; description: string }[]): Promise<{
  title: string; content: string; summary: string; chatgptPrompt: string
}> {
  const newsSummary = newsItems.map((n, i) => `${i + 1}. ${n.title}\n${n.description}`).join('\n\n')

  const prompt = `Kamu adalah editor konten untuk platform UMKMu.site — platform toko online untuk UMKM Indonesia.

Berikut adalah berita-berita terbaru tentang UMKM Indonesia:

${newsSummary}

Tugas kamu:
1. Tulis artikel blog berkualitas tinggi (600-800 kata) dalam Bahasa Indonesia berdasarkan tema dari berita-berita di atas
2. Artikel harus informatif, bermanfaat untuk pelaku UMKM, dan tidak sekadar merangkum berita
3. Sertakan tips praktis atau insight yang bisa langsung diterapkan
4. Gunakan tone yang hangat dan supportif

Balas HANYA dalam format JSON berikut (tanpa markdown, tanpa kode block):
{
  "title": "judul artikel yang menarik",
  "summary": "ringkasan 1-2 kalimat",
  "content": "isi artikel lengkap dalam format paragraf biasa",
  "chatgptPrompt": "prompt bahasa Inggris untuk generate gambar artikel di ChatGPT, deskriptif dan spesifik"
}`

  const provider = process.env.AI_PROVIDER ?? 'ollama'

  if (provider === 'gemini') {
    const { geminiChat } = await import('@/lib/ai/gemini')
    const result = await geminiChat([{ role: 'user', content: prompt }])
    return JSON.parse(result.replace(/```json\n?|\n?```/g, '').trim())
  }

  // Ollama
  const ollamaUrl = (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434/v1').replace('/v1', '')
  const res = await fetch(`${ollamaUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OLLAMA_MODEL ?? 'gemma4:12b',
      think: false,
      stream: false,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  const data = await res.json()
  const text = data.message?.content ?? ''
  return JSON.parse(text.replace(/```json\n?|\n?```/g, '').trim())
}

export async function POST() {
  try {
    // Fetch RSS
    const rssRes = await fetch(RSS_URL, { next: { revalidate: 0 } })
    const xml = await rssRes.text()
    const newsItems = parseRSS(xml)

    if (newsItems.length === 0) {
      return NextResponse.json({ error: 'Tidak ada berita ditemukan' }, { status: 422 })
    }

    // Generate artikel via AI
    const generated = await generateWithAI(newsItems)

    // Simpan ke database
    const supabase = createServiceClient()
    const { data: article, error } = await supabase
      .from('articles')
      .insert({
        title: generated.title,
        slug: slugify(generated.title),
        content: generated.content,
        summary: generated.summary,
        chatgpt_prompt: generated.chatgptPrompt,
        sources: newsItems.map(n => ({ title: n.title, link: n.link })),
        status: 'draft',
      })
      .select()
      .single()

    if (error) throw error

    // Kirim notifikasi Telegram
    await sendTelegramMessage(
      `📝 <b>Artikel baru siap review!</b>\n\n` +
      `<b>${generated.title}</b>\n\n` +
      `${generated.summary}\n\n` +
      `🔗 Lihat di: ${process.env.NEXT_PUBLIC_APP_URL}/admin/articles\n\n` +
      `🎨 <b>Prompt ChatGPT untuk gambar:</b>\n${generated.chatgptPrompt}`
    )

    return NextResponse.json({ article })
  } catch (err) {
    console.error('[admin/articles/generate]', err)
    return NextResponse.json({ error: 'Gagal generate artikel' }, { status: 500 })
  }
}
