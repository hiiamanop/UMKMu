import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'localhost:3000'
  const slug = extractSlug(hostname, rootDomain)

  if (!slug) return NextResponse.next()

  const url = request.nextUrl.clone()

  // API routes tidak perlu di-rewrite — biarkan Next.js handle langsung
  if (url.pathname.startsWith('/api/')) return NextResponse.next()
  const originalPath = url.pathname
  url.pathname = `/store/${slug}${originalPath}`

  return NextResponse.rewrite(url)
}

export function extractSlug(hostname: string, rootDomain: string): string | null {
  const host = hostname.split(':')[0]
  const root = rootDomain.split(':')[0]

  if (host === root || host === `www.${root}`) return null
  if (host === `dashboard.${root}`) return null

  if (host.endsWith(`.${root}`)) {
    const subdomain = host.slice(0, -(root.length + 1))
    if (subdomain && !subdomain.includes('.')) return subdomain
  }

  return null
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
