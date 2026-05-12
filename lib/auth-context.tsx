'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'
import { getUser, saveUser, clearAuthData, getToken, saveTokens, isTokenExpired } from './tokens'

/**
 * Auth Context - Global state for authentication
 */

interface StoredUser {
  id: number
  email: string
  nombre: string
  rol: string
}

interface AuthContextType {
  user: StoredUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (user: StoredUser, tokens: unknown) => void
  logout: () => void
  setUser: (user: StoredUser | null) => void
  checkAuth: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Auth Provider Component
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUserState] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true)
      try {
        const storedUser = getUser()
        const token = getToken()

        if (storedUser && token && !isTokenExpired()) {
          setUserState(storedUser)
        } else if (token && isTokenExpired()) {
          // Try to refresh token
          const refreshed = await refreshToken()
          if (!refreshed) {
            clearAuthData()
            setUserState(null)
          } else {
            const refreshedUser = getUser()
            setUserState(refreshedUser)
          }
        } else {
          setUserState(null)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        setUserState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthentication()
  }, [])

  const login = useCallback((newUser: StoredUser, tokens: any) => {
    saveUser(newUser)
    saveTokens({
      token: tokens.token,
      sessionToken: tokens.sessionToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn,
      expiresAt: Date.now() + tokens.expiresIn * 1000,
    })
    setUserState(newUser)
  }, [])

  const logout = useCallback(() => {
    clearAuthData()
    setUserState(null)
  }, [])

  const setUser = useCallback((newUser: StoredUser | null) => {
    if (newUser) {
      saveUser(newUser)
    } else {
      clearAuthData()
    }
    setUserState(newUser)
  }, [])

  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const token = getToken()
      if (!token) return false

      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      return response.ok
    } catch (error) {
      console.error('Error checking auth:', error)
      return false
    }
  }, [])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setUser,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Helper function to refresh token
 */
async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) return false

    const data = await response.json()
    if (data.tokens) {
      saveTokens({
        token: data.tokens.token,
        sessionToken: data.tokens.sessionToken,
        refreshToken: data.tokens.refreshToken,
        expiresIn: data.tokens.expiresIn,
        expiresAt: Date.now() + data.tokens.expiresIn * 1000,
      })
      return true
    }
    return false
  } catch (error) {
    console.error('Error refreshing token:', error)
    return false
  }
}
