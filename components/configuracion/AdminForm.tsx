'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export interface Admin {
  id: number
  email: string
  nombre: string
  celular?: string | null
  estado: string
}

interface AdminFormProps {
  admin?: Admin | null
  onClose: () => void
}

export function AdminForm({ admin, onClose }: AdminFormProps) {
  const isEdit = !!admin
  const [nombre, setNombre] = useState(admin?.nombre || '')
  const [email, setEmail] = useState(admin?.email || '')
  const [celular, setCelular] = useState(admin?.celular || '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const url = isEdit ? `/api/admins/${admin!.id}` : '/api/admins'
      const method = isEdit ? 'PATCH' : 'POST'
      const body: Record<string, unknown> = isEdit
        ? { nombre, celular }
        : { nombre, email, celular, password }
      if (password) body.password = password

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Error al guardar administrador')
        return
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? 'Editar administrador' : 'Nuevo administrador'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isEdit}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-100 disabled:text-gray-500"
            />
            {isEdit && <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Celular (opcional)</label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={9}
              value={celular ?? ''}
              onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isEdit ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!isEdit}
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">Mínimo 8 caracteres.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
