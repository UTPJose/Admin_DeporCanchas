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

  const titulo = initialData?.id ? 'Editar Campus' : 'Nuevo Campus'
  const inputCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{titulo}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body scroll */}
        <form
          id="campus-form"
          onSubmit={handleSubmit}
          className="px-6 py-5 overflow-y-auto flex-1 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={inputCls}
              placeholder="Ej: Campus Centro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
            <input
              type="text"
              value={formData.ubicacion}
              onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
              className={inputCls}
              placeholder="Ej: Av. Principal 123"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 shrink-0 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="campus-form"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}
