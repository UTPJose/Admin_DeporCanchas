'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useAuthLoading } from '@/hooks/useAuth'
import { useEffect } from 'react'

/**
 * Protected Route Component - Protege rutas que requieren autenticación
 */

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string[]
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const isLoading = useAuthLoading()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (requiredRole && user && !requiredRole.includes(user.rol_nombre)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router, user, requiredRole])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requiredRole && user && !requiredRole.includes(user.rol_nombre)) {
    return null
  }

  return <>{children}</>
}
