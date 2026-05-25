'use client'

import { useState } from 'react'
import { StatusBadge } from './StatusBadge'
import type { EstadoMostrado } from '@/lib/estado-reserva'

export interface Reservation {
  id: number
  usuario_nombre: string
  usuario_email: string
  campus_nombre: string
  cancha_nombre: string
  fechaLabel: string
  horaLabel: string
  metodoPago: string | null
  precio: number
  estado: EstadoMostrado
}

interface ReservationsTableProps {
  data: Reservation[]
  loading?: boolean
  onCancel?: (id: number) => Promise<void> | void
}

export function ReservationsTable({ data, loading, onCancel }: ReservationsTableProps) {
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

  // Solo se puede cancelar lo que está vigente (programada o pendiente de pago)
  const cancelable = (estado: EstadoMostrado) => estado === 'programada' || estado === 'pendiente'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cliente</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Cancha</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Fecha y hora</th>
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
                      <p className="font-medium text-gray-900">{res.usuario_nombre}</p>
                      <p className="text-xs text-gray-500">{res.usuario_email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{res.cancha_nombre}</p>
                      <p className="text-xs text-gray-500">{res.campus_nombre}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{res.fechaLabel}</p>
                      <p className="text-xs text-gray-500">{res.horaLabel}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">S/ {res.precio.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge estado={res.estado} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalle</h3>

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
              <p className="text-gray-600">Fecha y hora</p>
              <p className="font-medium text-gray-900">{selected.fechaLabel}</p>
              <p className="text-gray-500">{selected.horaLabel}</p>
            </div>

            {selected.metodoPago && (
              <div className="pt-3 border-t border-gray-200">
                <p className="text-gray-600">Método de pago</p>
                <p className="font-medium text-gray-900 capitalize">{selected.metodoPago}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Precio</p>
              <p className="text-2xl font-bold text-gray-900">S/ {selected.precio.toFixed(2)}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-gray-600">Estado</p>
              <p className="mt-2">
                <StatusBadge estado={selected.estado} />
              </p>
            </div>

            {cancelable(selected.estado) && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => onCancel?.(selected.id)}
                  className="w-full px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium transition-colors"
                >
                  Cancelar reserva
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
