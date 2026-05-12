'use client'

import { useContext } from 'react'
import { AuthContext } from '@/lib/auth-context'

/**
 * useAuth Hook - Use authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

/**
 * useIsAuthenticated Hook - Check if user is authenticated
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth()
  return isAuthenticated
}

/**
 * useUser Hook - Get current user
 */
export function useUser() {
  const { user } = useAuth()
  return user
}

/**
 * useAuthLoading Hook - Check if auth is loading
 */
export function useAuthLoading() {
  const { isLoading } = useAuth()
  return isLoading
}
