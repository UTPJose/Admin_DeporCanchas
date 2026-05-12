'use client'

import { ReactNode } from 'react'

interface CourtCardProps {
  name: string
  sport: string
  campus: string
  capacity: number
  status: 'active' | 'maintenance' | 'inactive'
  image?: string
  onEdit: () => void
  onDelete: () => void
}

const statusColors = {
  active: 'bg-green-100 text-green-700',
  maintenance: 'bg-amber-100 text-amber-700',
  inactive: 'bg-gray-100 text-gray-700',
}

const statusLabels = {
  active: 'Activa',
  maintenance: 'Mantenimiento',
  inactive: 'Inactiva',
}

export function CourtCard({ name, sport, campus, capacity, status, onEdit, onDelete }: CourtCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-6xl">
        🏐
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">{campus}</p>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <span className="text-gray-700">
            <span className="font-medium">{sport}</span>
          </span>
          <span className="text-gray-500">👥 {capacity}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded transition-colors"
          >
            Editar
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
