'use client'

import { ReactNode } from 'react'

interface Event {
  id: number
  title: string
  description?: string
  timestamp: string
  icon?: ReactNode
}

interface EventsListProps {
  events: Event[]
  loading?: boolean
  onViewAll?: () => void
}

export function EventsList({ events, loading, onViewAll }: EventsListProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-400">Cargando eventos...</div>
      </div>
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Ahora'
    if (diffMins < 60) return `Hace ${diffMins}m`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Últimos Eventos</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            Ver todos
          </button>
        )}
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No hay eventos disponibles</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              {event.icon && <div className="flex-shrink-0 text-lg">{event.icon}</div>}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                {event.description && <p className="text-xs text-gray-500 truncate">{event.description}</p>}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">{formatTime(event.timestamp)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
