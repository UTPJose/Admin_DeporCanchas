/**
 * API Response Types
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

/**
 * Auth Response Types
 */
export interface AuthTokenResponse {
  token: string
  sessionToken: string
  refreshToken: string
  expiresIn: number
}

export interface AuthResponse {
  user: {
    id: number
    email: string
    nombre: string
    rol: string
  }
  tokens: AuthTokenResponse
}

/**
 * Generic List Response
 */
export interface ListResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

