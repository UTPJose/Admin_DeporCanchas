import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth-service'
import { LoginRequest } from '@/types/auth'

/**
 * POST /api/auth/login
 * Login endpoint - Recibe credenciales y las transmite al microservicio Java
 */

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña requeridos' },
        { status: 400 }
      )
    }

    // Envía credenciales al microservicio Java
    const result = await authService.login(body)

    return NextResponse.json({
      success: true,
      data: {
        tokens: {
          token: result.accessToken,
          sessionToken: result.refreshToken,
          refreshToken: result.refreshToken,
          expiresIn: result.expiresIn,
        },
        user: {
          id: 0, // El microservicio Java no proporciona ID, podría obtenerse del token
          email: result.user.email,
          nombre: result.user.name,
          rol: result.user.role,
        },
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
    return NextResponse.json({ success: false, error: message }, { status: 401 })
  }
}
