import { NextRequest, NextResponse } from 'next/server'

/**
 * Middleware - Protección de rutas
 * Verifica autenticación en rutas protegidas
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['/login', '/register', '/']

  // Rutas protegidas
  const protectedRoutes = ['/dashboard', '/espacios', '/reservaciones', '/horarios', '/precios', '/reportes', '/configuracion']

  // Verificar si es ruta pública
  const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(route))

  // Verificar si es ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Obtener token del request
  const token = request.cookies.get('token')?.value || request.headers.get('authorization')?.replace('Bearer ', '')

  // Si es ruta protegida y no hay token, redirigir a login
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si es login/register y hay token, redirigir a dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
