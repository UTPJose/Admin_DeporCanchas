'use client'

import { FormEvent, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import toast from 'react-hot-toast'

/**
 * Login Page - Formulario de inicio de sesión
 */

export default function LoginPage() {
  const router = useRouter()
  const { refresh, isAuthenticated } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al iniciar sesión')
      }

      const data = await response.json()

      if (data.success) {
        // La cookie httpOnly ya fue seteada por el endpoint; refrescamos el contexto
        await refresh()
        toast.success('¡Bienvenido!')
        router.push('/dashboard')
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
      toast.error(message)
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-light to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-dark">DeporCanchas</h1>
          <p className="text-text-secondary mt-2">Panel Administrativo</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-dark"
                  disabled={isLoading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full">
              Iniciar Sesión
            </Button>
          </form>

        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-text-secondary mt-6">
          © 2026 DeporCanchas. Todos los derechos reservados.
        </p>
      </div>
    </div>
  )
}

