'use client'

import { X, Calendar, Clock, User, Hash, DollarSign } from 'lucide-react'
import { limaYMD, limaHour, limaMinutes } from '@/lib/lima-time'

export type ReservaEstadoDB = 'pendiente' | 'pagada' | 'cancelada' | 'expirada' | 'bloqueada'

export interface CalendarReservation {
  id: number
  court_id: number
  start_date: string
  end_date: string
  code: string | null
  estado_db: ReservaEstadoDB
  user_nombre?: string
  user_email?: string
  usuarios_id?: number | null
  precio_total?: number | null
}

interface Props {
  reservation: CalendarReservation
  canchaNombre?: string
  onClose: () => void
}

function timeRange(start: string, end: string) {
  const s = `${limaHour(start).toString().padStart(2, '0')}:${limaMinutes(start).toString().padStart(2, '0')}`
  const e = `${limaHour(end).toString().padStart(2, '0')}:${limaMinutes(end).toString().padStart(2, '0')}`
  return `${s} - ${e}`
}

const LABEL_ESTADO: Record<ReservaEstadoDB, string> = {
  pendiente: 'Pendiente',
  pagada: 'Pagada',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
  bloqueada: 'Bloqueada',
}

const COLOR_ESTADO: Record<ReservaEstadoDB, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pagada: 'bg-green-100 text-green-800 border-green-200',
  cancelada: 'bg-red-100 text-red-800 border-red-200',
  expirada: 'bg-gray-100 text-gray-700 border-gray-200',
  bloqueada: 'bg-amber-100 text-amber-800 border-amber-200',
}

/**
 * Modal de detalle de una reserva mostrada en el calendario semanal de
 * /horarios. Solo lectura — el admin no puede modificar la reserva desde aquí.
 */
export function ReservationDetailModal({ reservation, canchaNombre, onClose }: Props) {
  const fechaLabel = (() => {
    const ymd = limaYMD(reservation.start_date)
    const [y, m, d] = ymd.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    return dt.toLocaleDateString('es-PE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
  })()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Detalle de la reserva</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-sm">
          <div className="flex items-center justify-between">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${COLOR_ESTADO[reservation.estado_db]}`}
            >
              {LABEL_ESTADO[reservation.estado_db]}
            </span>
            {reservation.code && (
              <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                <Hash className="w-3 h-3 inline -mt-0.5 mr-0.5" />
                {reservation.code}
              </span>
            )}
          </div>

          <Row icon={<User className="w-4 h-4 text-gray-400" />} label="Cliente">
            <p className="font-medium text-gray-900">{reservation.user_nombre || '—'}</p>
            {reservation.user_email && (
              <p className="text-xs text-gray-500">{reservation.user_email}</p>
            )}
          </Row>

          {canchaNombre && (
            <Row icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Cancha">
              <p className="font-medium text-gray-900">{canchaNombre}</p>
            </Row>
          )}

          <Row icon={<Calendar className="w-4 h-4 text-gray-400" />} label="Fecha">
            <p className="font-medium text-gray-900 capitalize">{fechaLabel}</p>
          </Row>

          <Row icon={<Clock className="w-4 h-4 text-gray-400" />} label="Horario">
            <p className="font-medium text-gray-900">{timeRange(reservation.start_date, reservation.end_date)}</p>
          </Row>

          {reservation.precio_total != null && (
            <Row icon={<DollarSign className="w-4 h-4 text-gray-400" />} label="Precio">
              <p className="font-semibold text-gray-900">S/ {Number(reservation.precio_total).toFixed(2)}</p>
            </Row>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="pt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
    </div>
  )
}
