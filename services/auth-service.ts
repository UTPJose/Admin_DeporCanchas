import { apiClient } from '@/lib/api-client'
import {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  TokenResponse,
  UserResponse,
  RoleRequest,
} from '@/types/auth'

const AUTH_BASE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL
const AUTH_BASE_PATH = process.env.NEXT_PUBLIC_AUTH_SERVICE_BASE_PATH || '/api/v1/auth'
const AUTH_SERVICE_URL = `${AUTH_BASE_URL}${AUTH_BASE_PATH}`

/**
 * Auth Service - Comunicación con microservicio Java Spring Boot
 */

export const authService = {
  /**
   * Login - POST /api/v1/auth/login
   */
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error al iniciar sesión')
      }

      const data: TokenResponse = await response.json()
      return data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  /**
   * Register - POST /api/v1/auth/register
   * Siempre envía ROLE_ADMIN para administradores
   */
  async register(userData: RegisterRequest): Promise<UserResponse> {
    try {
      // Construir el objeto de registro con ROLE_ADMIN siempre
      const adminRoles: RoleRequest[] = [{ roleName: 'ROLE_ADMIN' }]

      const registerPayload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        phoneNumber: userData.phoneNumber || null,
        roles: adminRoles, // Siempre enviar ROLE_ADMIN
      }
      
      const response = await fetch(`${AUTH_SERVICE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerPayload),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error al registrar usuario')
      }

      const data: UserResponse = await response.json()
      return data
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },

  /**
   * Refresh Token - POST /api/v1/auth/refresh
   */
  async refreshToken(refreshTokenValue?: string): Promise<TokenResponse> {
    try {
      const body = refreshTokenValue ? { refreshToken: refreshTokenValue } : undefined

      const response = await fetch(`${AUTH_SERVICE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
        ...(body && { body: JSON.stringify(body) }),
      })

      if (!response.ok) {
        throw new Error('Error al refrescar token')
      }

      const data: TokenResponse = await response.json()
      return data
    } catch (error) {
      console.error('Refresh token error:', error)
      throw error
    }
  },

  /**
   * Logout - POST /api/v1/auth/logout
   */
  async logout(): Promise<void> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies
      })

      if (!response.ok) {
        throw new Error('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  /**
   * Verify Token - Verifica si un token es válido (usando el endpoint de refresh como verificación)
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`${AUTH_SERVICE_URL}/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      return response.ok
    } catch (error) {
      console.error('Verify token error:', error)
      return false
    }
  },
}
