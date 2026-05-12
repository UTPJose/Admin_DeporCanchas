'use client'

interface CampusCardProps {
  name: string
  location: string
  courtsCount: number
  reservationsCount: number
  onEdit: () => void
  onDelete: () => void
  onExpand?: () => void
}

export function CampusCard({
  name,
  location,
  courtsCount,
  reservationsCount,
  onEdit,
  onDelete,
  onExpand,
}: CampusCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div
        className="h-24 bg-gradient-to-r from-blue-400 to-blue-600"
        onClick={onExpand}
        role="button"
        tabIndex={0}
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">📍 {location}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
          <div>
            <p className="text-sm text-gray-600">Canchas</p>
            <p className="text-2xl font-bold text-gray-900">{courtsCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Reservas</p>
            <p className="text-2xl font-bold text-green-600">{reservationsCount}</p>
          </div>
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
