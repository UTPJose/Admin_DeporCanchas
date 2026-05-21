'use client'

import { useState, useEffect } from 'react'

interface CourtModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CourtFormData) => Promise<void>
  campuses: Array<{ id: number; nombre: string }>
  initialData?: CourtFormData & { id?: number }
  loading?: boolean
}

export interface CourtFormData {
  campus_id: number
  nombre: string
  tipo_deporte: string
  cantidad_jugadores: number
  estado: 'active' | 'maintenance' | 'inactive'
}

export function CourtModal({
  isOpen,
  onClose,
  onSubmit,
  campuses,
  initialData,
  loading,
}: CourtModalProps) {
  const [formData, setFormData] = useState<CourtFormData>(
    initialData || {
      campus_id: campuses[0]?.id || 0,
      nombre: '',
      tipo_deporte: 'Futbol',
      cantidad_jugadores: 10,
      estado: 'active',
    }
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        campus_id: initialData.campus_id,
        nombre: initialData.nombre,
        tipo_deporte: initialData.tipo_deporte,
        cantidad_jugadores: initialData.cantidad_jugadores,
        estado: initialData.estado,
      })
    } else {
      setFormData({
        campus_id: campuses[0]?.id || 0,
        nombre: '',
        tipo_deporte: 'Futbol',
        cantidad_jugadores: 10,
        estado: 'active',
      })
    }
    setError(null)
  }, [initialData, campuses, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    try {
      await onSubmit(formData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {initialData?.id ? 'Editar Cancha' : 'Nueva Cancha'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
            <select
              value={formData.campus_id}
              onChange={(e) => setFormData({ ...formData, campus_id: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Ej: Cancha 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deporte</label>
            <select
              value={formData.tipo_deporte}
              onChange={(e) => setFormData({ ...formData, tipo_deporte: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option>Futbol</option>
              <option>Voleibol</option>
              <option>Basquetbol</option>
              <option>Tenis</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jugadores</label>
            <input
              type="number"
              value={formData.cantidad_jugadores}
              onChange={(e) => setFormData({ ...formData, cantidad_jugadores: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="active">Activa</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="inactive">Inactiva</option>
            </select>
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
