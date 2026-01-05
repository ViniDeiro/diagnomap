import { NextResponse } from 'next/server'

export const config = {
  matcher: ['/((?!_next|favicon.ico|robots.txt|sitemap.xml|assets|public).*)'],
}

export function middleware(req: Request) {
  const url = new URL(req.url)
  const path = url.pathname
  if (process.env.NODE_ENV !== 'production') return NextResponse.next()
  if (path === '/') return NextResponse.redirect(new URL('/docs/hipercalemia', req.url))
  if (path.startsWith('/docs/hipercalemia')) return NextResponse.next()
  return new NextResponse(null, { status: 404 })
}
