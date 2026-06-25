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
  /** true si es el super-admin (único que ve y opera la pestaña de Administradores). */
  isSuper?: boolean
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

  /**
   * Cierre de sesión:
   *  1) POST /api/auth/logout para que el server invalide la cookie httpOnly.
   *  2) Limpia el user del contexto (la UI deja de mostrar el nombre).
   *  3) Redirige a /login. Lo hace adentro del logout para que cualquier
   *     consumidor (Header, Sidebar) tenga el mismo comportamiento sin
   *     manejar el redirect a mano (lo cual provocaba race conditions: el
   *     navegador cancelaba el fetch antes de borrar la cookie).
   *
   * Usar `window.location.assign` (no `.href = ...`) hace una navegación
   * completa que descarta cualquier estado en memoria del cliente.
   */
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Aunque falle el fetch, continuamos: la UI debe quedar deslogueada
      // en cliente; el server cierra la sesión cuando la cookie expire.
    }
    setUser(null)
    if (typeof window !== 'undefined') {
      window.location.assign('/login')
    }
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
