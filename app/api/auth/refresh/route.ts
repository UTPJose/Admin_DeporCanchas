import { NextRequest, NextResponse } from 'next/server'
import { getRefreshToken } from '@/lib/tokens'
import { authService } from '@/services/auth-service'

/**
 * POST /api/auth/refresh
 * Refresca el token JWT usando el refreshToken
 * Comunicación con el microservicio Java Spring Boot
 */

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Refresh token no encontrado' },
        { status: 401 }
      )
    }

    // Obtiene nuevo token del microservicio Java
    const result = await authService.refreshToken(refreshToken)

    return NextResponse.json({
      success: true,
      tokens: {
        token: result.accessToken,
        sessionToken: result.refreshToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      },
    })
  } catch (error) {
    console.error('Error refreshing token:', error)
    return NextResponse.json(
      { success: false, error: 'Error al refrescar token' },
      { status: 401 }
    )
  }
}

