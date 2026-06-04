'use client'

import { useEffect, useState } from 'react'

interface CampusModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CampusFormData) => Promise<void>
  initialData?: CampusFormData & { id?: number }
  loading?: boolean
}

export interface CampusFormData {
  nombre: string
  ubicacion: string
}

export function CampusModal({ isOpen, onClose, onSubmit, initialData, loading }: CampusModalProps) {
  const [formData, setFormData] = useState<CampusFormData>(
    initialData || { nombre: '', ubicacion: '' }
  )
  const [error, setError] = useState<string | null>(null)

  // Re-sincronizar el formulario cada vez que se abre o cambia el campus a editar
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setFormData(initialData ?? { nombre: '', ubicacion: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    if (!formData.ubicacion.trim()) {
      setError('La ubicación es requerida')
      return
    }

    try {
      await onSubmit(formData)
      setFormData({
        nombre: '',
        ubicacion: '',
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {initialData?.id ? 'Editar Campus' : 'Nuevo Campus'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Ej: Campus Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
