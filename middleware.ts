import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

/**
 * Middleware — protección de rutas del panel admin.
 * - Páginas del dashboard: sin sesión válida → redirige a /login.
 * - API de datos (`/api/*` excepto `/api/auth/*`): sin sesión válida → 401.
 * Verifica la cookie `admin_session` (JWT firmado con ADMIN_JWT_SECRET).
 * El re-check de rol/estado real vive en cada Route Handler con requireAdmin().
 */

const ADMIN_COOKIE = 'admin_session'

const PROTECTED_PAGES = ['/dashboard', '/espacios', '/reservaciones', '/horarios', '/precios', '/reportes', '/configuracion']

async function hasValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    await jwtVerify(token, secret, { algorithms: ['HS256'] })
    return true
  } catch {
    return false
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const valid = await hasValidSession(token)

  // API de datos protegida (deja pasar /api/auth/*)
  if (pathname.startsWith('/api/')) {
    if (pathname.startsWith('/api/auth/')) return NextResponse.next()
    if (!valid) {
      return NextResponse.json({ success: false, error: 'unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }

  const isProtectedPage = PROTECTED_PAGES.some((r) => pathname.startsWith(r))
  if (isProtectedPage && !valid) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (pathname === '/login' && valid) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
