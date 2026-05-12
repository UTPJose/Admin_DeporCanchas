'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { saveTokens, saveUser } from '@/lib/tokens'
import toast from 'react-hot-toast'

/**
 * Callback Content - Maneja el callback del microservicio Java
 */

export default function CallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Obtener parámetros del callback
        const token = searchParams.get('token')
        const sessionToken = searchParams.get('sessionToken')
        const refreshToken = searchParams.get('refreshToken')
        const expiresIn = searchParams.get('expiresIn')
        const userParam = searchParams.get('user')

        if (!token || !sessionToken || !refreshToken || !userParam) {
          toast.error('Datos de autenticación incompletos')
          router.push('/login')
          return
        }

        // Parsear datos del usuario
        const user = JSON.parse(decodeURIComponent(userParam))

        // Guardar tokens y usuario
        const tokens = {
          token,
          sessionToken,
          refreshToken,
          expiresIn: parseInt(expiresIn || '3600', 10),
          expiresAt: Date.now() + parseInt(expiresIn || '3600', 10) * 1000,
        }

        saveTokens(tokens)
        saveUser(user)
        login(user, tokens)

        toast.success('¡Bienvenido!')
        router.push('/dashboard')
      } catch (error) {
        console.error('Error in callback:', error)
        toast.error('Error al procesar autenticación')
        router.push('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, login])

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-light">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-dark mb-4">Procesando...</h1>
        <p className="text-text-secondary mb-8">Por favor espere mientras se completa la autenticación</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
