'use client'

import { useEffect, useState } from 'react'

export interface TipoOption {
  valor: string
  etiqueta: string
}

interface CourtModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CourtFormData) => Promise<void>
  campuses: Array<{ id: number; nombre: string }>
  tipos: TipoOption[]
  initialData?: CourtFormData & { id?: number }
  loading?: boolean
}

export interface CourtFormData {
  campus_id: number
  nombre: string
  tipo_deporte: string
  cantidad_jugadores: number
  estado: 'activo' | 'mantenimiento' | 'inactivo'
  imagen_url?: string | null
  hora_abre?: string // 'HH:MM' (UI); el server normaliza a HH:MM:SS
  hora_cierra?: string
  precio_default?: number | null
}

function emptyForm(campuses: Array<{ id: number }>, tipos: TipoOption[]): CourtFormData {
  return {
    campus_id: campuses[0]?.id || 0,
    nombre: '',
    tipo_deporte: tipos[0]?.valor ?? '',
    cantidad_jugadores: 10,
    estado: 'activo',
    imagen_url: null,
    hora_abre: '08:00',
    hora_cierra: '22:00',
    precio_default: null,
  }
}

export function CourtModal({
  isOpen,
  onClose,
  onSubmit,
  campuses,
  tipos,
  initialData,
  loading,
}: CourtModalProps) {
  const [formData, setFormData] = useState<CourtFormData>(initialData ?? emptyForm(campuses, tipos))
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  // submitting evita doble/triple submit si el usuario clickea rápido o el browser hace doble-click.
  const [submitting, setSubmitting] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/courts/image', { method: 'POST', body: fd })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Error al subir imagen')
        return
      }
      setFormData((prev) => ({ ...prev, imagen_url: json.url }))
    } catch {
      setError('Error al subir imagen')
    } finally {
      setUploading(false)
    }
  }

  // Re-sincronizar el formulario cada vez que se abre o cambia la cancha a editar
  useEffect(() => {
    if (!isOpen) return
    setError(null)
    const base = initialData ?? emptyForm(campuses, tipos)
    setFormData({
      ...base,
      hora_abre: base.hora_abre ?? '08:00',
      hora_cierra: base.hora_cierra ?? '22:00',
    })
    // En modo edición, traer el horario real de la cancha (usa la 1ra fila de
    // disponibilidad; asumimos que las 7 filas tienen el mismo rango).
    if (isOpen && initialData?.id) {
      fetch(`/api/schedules?action=availability&court_id=${initialData.id}`)
        .then((r) => r.json())
        .then((j) => {
          const first = j?.data?.[0]
          if (first?.hora_abre && first?.hora_cierra) {
            setFormData((prev) => ({
              ...prev,
              hora_abre: String(first.hora_abre).slice(0, 5),
              hora_cierra: String(first.hora_cierra).slice(0, 5),
            }))
          }
        })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return // guard anti-doble-submit
    setError(null)

    if (!formData.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
      setFormData(emptyForm(campuses, tipos))
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSubmitting(false)
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cancha</label>
            <select
              value={formData.tipo_deporte}
              onChange={(e) => setFormData({ ...formData, tipo_deporte: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              {/* Si la cancha tiene un tipo que ya no está activo, lo mostramos igual */}
              {formData.tipo_deporte && !tipos.some((t) => t.valor === formData.tipo_deporte) && (
                <option value={formData.tipo_deporte}>{formData.tipo_deporte}</option>
              )}
              {tipos.map((t) => (
                <option key={t.valor} value={t.valor}>{t.etiqueta}</option>
              ))}
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora abre</label>
              <input
                type="time"
                value={formData.hora_abre ?? '08:00'}
                onChange={(e) => setFormData({ ...formData, hora_abre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora cierra</label>
              <input
                type="time"
                value={formData.hora_cierra ?? '22:00'}
                onChange={(e) => setFormData({ ...formData, hora_cierra: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
                required
              />
            </div>
          </div>
          <p className="-mt-2 text-xs text-gray-500">
            Se aplica a los 7 días de la semana.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio default (S/ por hora)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={
                formData.precio_default === null || formData.precio_default === undefined || Number.isNaN(formData.precio_default)
                  ? ''
                  : formData.precio_default
              }
              onChange={(e) =>
                setFormData({
                  ...formData,
                  precio_default: e.target.value === '' ? null : parseFloat(e.target.value),
                })
              }
              placeholder="100.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <p className="text-xs text-gray-500 mt-1">
              Se usa cuando ninguna regla de Precios aplica. Editable luego en Precios.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="activo">Activa</option>
              <option value="mantenimiento">Mantenimiento</option>
              <option value="inactivo">Inactiva</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
            {formData.imagen_url ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.imagen_url}
                  alt="Cancha"
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, imagen_url: null })}
                  className="text-sm text-red-600 hover:underline"
                >
                  Quitar
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
                className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 disabled:opacity-50"
              />
            )}
            {uploading && <p className="text-xs text-gray-500 mt-1">Subiendo imagen...</p>}
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
              disabled={loading || uploading || submitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
            >
              {submitting || loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
