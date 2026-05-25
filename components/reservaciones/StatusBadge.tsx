'use client'

import { type EstadoMostrado, ESTADO_MOSTRADO_LABEL } from '@/lib/estado-reserva'

interface StatusBadgeProps {
  /** estado mostrado ya derivado (programada/finalizada/pendiente/cancelada/expirada) */
  estado: EstadoMostrado
}

const config: Record<EstadoMostrado, { bg: string; text: string }> = {
  programada: { bg: 'bg-green-100', text: 'text-green-700' },
  finalizada: { bg: 'bg-blue-100', text: 'text-blue-700' },
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-700' },
  expirada: { bg: 'bg-gray-200', text: 'text-gray-600' },
}

export function StatusBadge({ estado }: StatusBadgeProps) {
  const c = config[estado] ?? config.pendiente
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
      {ESTADO_MOSTRADO_LABEL[estado] ?? estado}
    </span>
  )
}
