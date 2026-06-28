import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'

export default async function ArticlesPage() {
  const db = createServiceClient()
  const { data: articles } = await db
    .from('articles')
    .select('id, title, summary, status, created_at, published_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#0A2F73]">Artikel</h1>
        <Link
          href="/admin/articles/generate"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#0A2F73] hover:opacity-90 transition-opacity"
        >
          + Generate Artikel
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-[#E5EAF0] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F8FAFC] border-b border-[#E5EAF0]">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Judul</th>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Status</th>
              <th className="text-left px-5 py-3 font-medium text-[#5E6B85]">Dibuat</th>
            </tr>
          </thead>
          <tbody>
            {!articles?.length && (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-[#5E6B85]">Belum ada artikel. Generate sekarang!</td></tr>
            )}
            {articles?.map((a) => (
              <tr key={a.id} className="border-b border-[#E5EAF0] last:border-0 hover:bg-[#F8FAFC]">
                <td className="px-5 py-4">
                  <div className="font-medium text-[#0A2F73]">{a.title}</div>
                  {a.summary && <div className="text-xs text-[#5E6B85] mt-0.5 line-clamp-1">{a.summary}</div>}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    a.status === 'published' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    {a.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-5 py-4 text-[#5E6B85]">
                  {new Date(a.created_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
