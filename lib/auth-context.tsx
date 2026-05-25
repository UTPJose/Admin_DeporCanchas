'use client'

import React, { createContext, useCallback, useEffect, useState } from 'react'

/**
 * Auth Context — sesión admin basada en cookie httpOnly (admin_session).
 * El token vive solo en la cookie; el cliente nunca lo ve. Para conocer al
 * usuario actual se consulta /api/auth/me.
 */

export interface AdminUser {
  id: number
  email: string
  nombre: string
  celular?: string | null
  dni?: string | null
  roles_id: number
  rol_nombre: string
}

interface AuthContextType {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  refresh: () => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setUser(json?.data?.user ?? null)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    setUser(null)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    refresh,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
