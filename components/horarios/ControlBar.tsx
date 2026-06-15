'use client'

import { Button } from '@/components/common/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ClientSearchInput, ClientSearchValue } from '@/components/common/ClientSearchInput'

interface ControlBarProps {
  selectedCampus: number | null
  selectedCourt: number | null
  weekStart: string
  weekEnd: string
  campuses: Array<{ id: number; nombre: string }>
  courts: Array<{ id: number; nombre: string }>
  selectedClient: ClientSearchValue | null
  onCampusChange: (campusId: number) => void
  onCourtChange: (courtId: number) => void
  onPrevWeek: () => void
  onNextWeek: () => void
  onClientChange: (c: ClientSearchValue | null) => void
}

export function ControlBar({
  selectedCampus,
  selectedCourt,
  weekStart,
  weekEnd,
  campuses,
  courts,
  selectedClient,
  onCampusChange,
  onCourtChange,
  onPrevWeek,
  onNextWeek,
  onClientChange,
}: ControlBarProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onPrevWeek} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600">
            {formatDate(weekStart)} - {formatDate(weekEnd)}
          </span>
          <button onClick={onNextWeek} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-gray-500">Semana actual</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
          <select
            value={selectedCampus || ''}
            onChange={(e) => onCampusChange(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar campus</option>
            {campuses.map((campus) => (
              <option key={campus.id} value={campus.id}>
                {campus.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cancha</label>
          <select
            value={selectedCourt || ''}
            onChange={(e) => onCourtChange(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Seleccionar cancha</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.nombre}
              </option>
            ))}
          </select>
        </div>

        <ClientSearchInput
          label="Cliente (filtro opcional)"
          value={selectedClient}
          onChange={onClientChange}
          placeholder="Nombre o correo…"
        />
      </div>
    </div>
  )
}
