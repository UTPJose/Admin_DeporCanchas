/**
 * Auth Service Types - Tipos para respuestas del microservicio Java Spring Boot
 */

/**
 * Request Types
 */
export interface RoleRequest {
  roleName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phoneNumber?: string
  roles?: RoleRequest[]
  confirmPassword?: string
}

export interface RefreshTokenRequest {
  refreshToken: string
}

/**
 * Response Types
 */
export interface UserResponse {
  email: string
  name: string
  password?: string
  enable: boolean
  role: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: UserResponse
}

/**
 * Session Token type (from JWT payload)
 */
export interface SessionToken {
  sub: string
  email: string
  name: string
  role: string
  iat: number
  exp: number
}

/**
 * Auth Service Error Response
 */
export interface AuthErrorResponse {
  message: string
  status: number
  timestamp: string
}

