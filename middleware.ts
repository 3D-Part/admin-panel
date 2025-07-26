import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = [
  '/login',
  '/auth/verify',
  '/_next',
  '/api',
  '/favicon.ico',
  '/assets',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Get refresh token from cookies
  const refreshToken = request.cookies.get('refreshToken')?.value

  // If no refresh token, redirect to login
  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If we have a refresh token, allow access
  // The axios interceptor will handle access token refresh when needed
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!login|auth/verify|_next|api|favicon.ico|assets).*)'],
}
