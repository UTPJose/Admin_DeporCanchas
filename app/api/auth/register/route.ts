import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth-service'
import { RegisterRequest } from '@/types/auth'

/**
 * POST /api/auth/register
 * Register endpoint - Recibe datos de usuario y los transmite al microservicio Java
 */

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        { success: false, error: 'Email, nombre y contraseña requeridos' },
        { status: 400 }
      )
    }

    // Envía datos de registro al microservicio Java
    const result = await authService.register(body)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          email: result.email,
          nombre: result.name,
          rol: result.role,
        },
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    const message = error instanceof Error ? error.message : 'Error al registrar usuario'
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
