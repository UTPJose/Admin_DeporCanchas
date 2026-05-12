import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/auth-service'

/**
 * POST /api/auth/verify
 * Verifica que un token JWT sea válido
 * Comunicación con el microservicio Java Spring Boot
 */

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token requerido' }, { status: 400 })
    }

    // Verifica el token con el microservicio Java
    const isValid = await authService.verifyToken(token)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { valid: true },
    })
  } catch (error) {
    console.error('Error verifying token:', error)
    return NextResponse.json(
      { success: false, error: 'Error al verificar token' },
      { status: 500 }
    )
  }
}

