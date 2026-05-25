'use client'

import { useState } from 'react'
import { Button } from '@/components/common/Button'
import { X } from 'lucide-react'
import { limaToUtcISO } from '@/lib/lima-time'

interface BlockModalProps {
  courtId: number
  initialDate: string
  initialStartTime: string
  initialEndTime: string
  onClose: () => void
  onSave: () => void
  /** Si viene, el modal está en modo edición de un bloqueo existente. */
  blockId?: number
  initialReason?: string
  /** Email del admin que creó el bloqueo (solo display en edición). */
  createdByEmail?: string
  /** Eliminar el bloqueo (solo en modo edición). */
  onDelete?: () => void
}

export function BlockModal({
  courtId,
  initialDate,
  initialStartTime,
  initialEndTime,
  onClose,
  onSave,
  blockId,
  initialReason,
  createdByEmail,
  onDelete,
}: BlockModalProps) {
  const isEdit = !!blockId
  const [allDay, setAllDay] = useState(false)
  const [date, setDate] = useState(initialDate)
  const [startTime, setStartTime] = useState(initialStartTime)
  const [endTime, setEndTime] = useState(initialEndTime)
  const [reason, setReason] = useState(initialReason ?? '')
  const [repetition, setRepetition] = useState('no_repeat')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Calculate full date-time strings safely
      const getSafeTime = (time: string, isAllDay: boolean, defaultTime: string) => {
        if (isAllDay) return defaultTime
        if (!time) return defaultTime
        return time.split(':').length === 2 ? `${time}:00` : time
      }

      // Las horas son de pared (Lima); las convertimos a instante UTC correcto
      const startDate = limaToUtcISO(date, getSafeTime(startTime, allDay, '00:00:00'))
      const endDate = limaToUtcISO(date, getSafeTime(endTime, allDay, '23:59:59'))

      const response = isEdit
        ? await fetch('/api/schedules', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: blockId,
              start_date: startDate,
              end_date: endDate,
              reason: reason || 'Bloqueo manual',
            }),
          })
        : await fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'block',
              court_id: courtId,
              start_date: startDate,
              end_date: endDate,
              reason: reason || 'Bloqueo manual',
              all_day: allDay,
              day: date, // YMD Lima, para el modo "todo el día" en el server
            }),
          })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Error al guardar bloqueo')
        return
      }

      onSave()
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
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Editar Bloqueo' : 'Crear Bloqueo'}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {!isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="all_day"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="all_day" className="text-sm font-medium text-gray-700 select-none cursor-pointer">
                Todo el día
              </label>
            </div>
          )}

          {!isEdit && allDay && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] leading-relaxed flex items-start gap-2 animate-fadeIn">
              <span className="font-bold text-amber-700 uppercase tracking-wide shrink-0 bg-amber-200/60 px-1.5 py-0.5 rounded-sm text-[8px] mt-0.5">INFO</span>
              <span>Nota: Al bloquear todo el día, se detectarán y respetarán las reservas existentes, bloqueando únicamente las horas disponibles del día.</span>
            </div>
          )}

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Inicio
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora Fin
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Mantenimiento, Evento especial..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repetición</label>
              <select
                value={repetition}
                onChange={(e) => setRepetition(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="no_repeat">No repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensualmente</option>
              </select>
            </div>
          )}

          {isEdit && createdByEmail && (
            <p className="text-xs text-gray-500">
              Creado por: <span className="font-medium text-gray-700">{createdByEmail}</span>
            </p>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Guardar Bloqueo'}
            </Button>
          </div>

          {isEdit && onDelete && (
            <Button
              type="button"
              onClick={onDelete}
              className="w-full px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm"
            >
              Eliminar bloqueo
            </Button>
          )}
        </form>
      </div>
    </div>
  )
}
