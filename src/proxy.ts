import { type NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/sign-in']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )

  // Get session cookie
  const session = request.cookies.get('session')

  // Redirect to sign-in if accessing protected route without session
  if (!isPublicRoute && !session) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirect to schemas if accessing sign-in with valid session
  if (pathname === '/sign-in' && session) {
    return NextResponse.redirect(new URL('/schemas', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
