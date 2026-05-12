'use client'

import { useState } from 'react'
import { StatusBadge } from './StatusBadge'

interface Reservation {
  id: number
  usuario_nombre: string
  usuario_email: string
  campus_nombre: string
  cancha_nombre: string
  fecha: string
  hora_inicio: string
  precio: number
  estado: string
}

interface ReservationsTableProps {
  data: Reservation[]
  loading?: boolean
  onStatusChange?: (id: number, newStatus: string) => Promise<void>
  onCancel?: (id: number) => Promise<void>
}

export function ReservationsTable({ data, loading, onStatusChange, onCancel }: ReservationsTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const selected = data.find((r) => r.id === selectedId)

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center text-gray-500">
        Cargando reservaciones...
      </div>
    )
  }

  const handleViewDetail = (id: number) => {
    setSelectedId(id)
    setIsDetailOpen(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cancha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Precio</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No hay reservaciones
                  </td>
                </tr>
              ) : (
                data.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => handleViewDetail(res.id)}
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedId === res.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{res.usuario_nombre}</p>
                        <p className="text-xs text-gray-500">{res.usuario_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{res.cancha_nombre}</p>
                        <p className="text-xs text-gray-500">{res.campus_nombre}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{new Date(res.fecha).toLocaleDateString('es-PE')}</p>
                        <p className="text-xs text-gray-500">{res.hora_inicio}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">S/ {res.precio}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={res.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {[1, 2, 3].map((p) => (
            <button
              key={p}
              className="px-3 py-1 rounded border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {isDetailOpen && selected && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 h-fit">
          <button
            onClick={() => setIsDetailOpen(false)}
            className="text-gray-500 hover:text-gray-700 float-right text-xl"
          >
            ×
          </button>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-600">Cliente</p>
              <p className="font-medium text-gray-900">{selected.usuario_nombre}</p>
              <p className="text-gray-500">{selected.usuario_email}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Reserva</p>
              <p className="font-medium text-gray-900">{selected.cancha_nombre}</p>
              <p className="text-gray-500">{selected.campus_nombre}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Fecha y Hora</p>
              <p className="font-medium text-gray-900">{new Date(selected.fecha).toLocaleDateString('es-PE')}</p>
              <p className="text-gray-500">{selected.hora_inicio}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Precio</p>
              <p className="text-2xl font-bold text-gray-900">S/ {selected.precio}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Estado</p>
              <p className="mt-2">
                <StatusBadge status={selected.estado} />
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200 space-y-2">
              {selected.estado !== 'cancelado' && (
                <>
                  <button
                    onClick={() => onCancel?.(selected.id)}
                    className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                  {selected.estado !== 'finalizado' && (
                    <button
                      onClick={() => onStatusChange?.(selected.id, 'finalizado')}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                    >
                      Marcar Finalizado
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
