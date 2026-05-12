/**
 * Token Management - Manejo seguro de JWT, sessionToken y refreshToken
 * Integración con microservicio Java Spring Boot
 */

const TOKEN_KEY = 'token'
const SESSION_TOKEN_KEY = 'sessionToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const TOKEN_EXPIRY_KEY = 'tokenExpiry'
const USER_KEY = 'user'

/**
 * Token Storage Interface
 */
interface StorageToken {
  token: string
  sessionToken: string
  refreshToken: string
  expiresIn: number
  expiresAt: number
}

interface StoredUser {
  id: number
  email: string
  nombre: string
  rol: string
}

/**
 * Check if running on client side
 */
const isClient = typeof window !== 'undefined'

/**
 * Save tokens to localStorage
 */
export function saveTokens(tokens: StorageToken): void {
  if (!isClient) return

  try {
    localStorage.setItem(TOKEN_KEY, tokens.token)
    localStorage.setItem(SESSION_TOKEN_KEY, tokens.sessionToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
    localStorage.setItem(TOKEN_EXPIRY_KEY, String(tokens.expiresAt))
  } catch (error) {
    console.error('Error saving tokens:', error)
  }
}

/**
 * Get token from localStorage
 */
export function getToken(): string | null {
  if (!isClient) return null

  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch (error) {
    console.error('Error getting token:', error)
    return null
  }
}

/**
 * Get session token
 */
export function getSessionToken(): string | null {
  if (!isClient) return null

  try {
    return localStorage.getItem(SESSION_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting session token:', error)
    return null
  }
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  if (!isClient) return null

  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

/**
 * Get token expiry time
 */
export function getTokenExpiry(): number | null {
  if (!isClient) return null

  try {
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
    return expiry ? parseInt(expiry, 10) : null
  } catch (error) {
    console.error('Error getting token expiry:', error)
    return null
  }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  return Date.now() > expiry
}

/**
 * Check if token needs refresh (expires in less than 5 minutes)
 */
export function shouldRefreshToken(): boolean {
  const expiry = getTokenExpiry()
  if (!expiry) return true
  const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
  return expiry < fiveMinutesFromNow
}

/**
 * Save user to localStorage
 */
export function saveUser(user: StoredUser): void {
  if (!isClient) return

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } catch (error) {
    console.error('Error saving user:', error)
  }
}

/**
 * Get user from localStorage
 */
export function getUser(): StoredUser | null {
  if (!isClient) return null

  try {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

/**
 * Clear all auth data
 */
export function clearAuthData(): void {
  if (!isClient) return

  try {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(SESSION_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(USER_KEY)
  } catch (error) {
    console.error('Error clearing auth data:', error)
  }
}

/**
 * Decode JWT token (simple decoding, not verification)
 */
export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
    return decoded
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Get token expiry from JWT payload
 */
export function getTokenExpiryFromJWT(token: string): number | null {
  const decoded = decodeToken(token)
  if (!decoded || typeof decoded.exp !== 'number') return null
  return decoded.exp * 1000 // Convert seconds to milliseconds
}
