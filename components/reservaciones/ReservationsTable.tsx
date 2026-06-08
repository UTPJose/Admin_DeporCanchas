'use client'

import { useEffect, useState } from 'react'
import { StatusBadge } from './StatusBadge'
import type { EstadoMostrado } from '@/lib/estado-reserva'

const PAGE_SIZE = 10

export interface ReservationRefund {
  id: number
  monto: number
  porcentaje: number
  estado: 'pendiente' | 'procesado' | 'fallido'
  metodo_destino: string | null
  destino_detalle: string | null
  procesado_en: string | null
}

export interface Reservation {
  id: number
  code: string
  usuario_nombre: string
  usuario_email: string
  campus_nombre: string
  cancha_nombre: string
  fechaLabel: string
  horaLabel: string
  metodoPago: string | null
  precio: number
  estado: EstadoMostrado
  reembolso: ReservationRefund | null
}

interface ReservationsTableProps {
  data: Reservation[]
  loading?: boolean
  onCancel?: (id: number) => Promise<void> | void
  onMarkRefundProcessed?: (refundId: number) => Promise<void> | void
}

export function ReservationsTable({ data, loading, onCancel, onMarkRefundProcessed }: ReservationsTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Reiniciar a la primera página cuando cambian los datos (filtros)
  useEffect(() => setPage(1), [data])

  const selected = data.find((r) => r.id === selectedId)

  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageData = data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

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
                <th className="px-4 py-3 text-left font-semibold text-gray-700">Código</th>
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
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No hay reservaciones
                  </td>
                </tr>
              ) : (
                pageData.map((res) => (
                  <tr
                    key={res.id}
                    onClick={() => handleViewDetail(res.id)}
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedId === res.id ? 'bg-green-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                        {res.code}
                      </span>
                    </td>
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

        {data.length > 0 && (
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <span>
              Mostrando {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, data.length)} de{' '}
              {data.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Anterior
              </button>
              <span className="px-2">Página {currentPage} de {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
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
              <p className="text-gray-600">Código de reserva</p>
              <p className="font-mono font-semibold text-base text-gray-900 mt-0.5">{selected.code}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
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

            {selected.reembolso && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-gray-600 mb-2">Reembolso</p>
                <div className={`rounded-lg p-3 ${
                  selected.reembolso.estado === 'procesado'
                    ? 'bg-green-50 border border-green-200'
                    : selected.reembolso.estado === 'pendiente'
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-gray-900">S/ {selected.reembolso.monto.toFixed(2)}</span>
                    <span className="text-xs text-gray-600">({selected.reembolso.porcentaje}%)</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 capitalize">
                    Estado: <span className="font-semibold">{selected.reembolso.estado}</span>
                    {selected.reembolso.procesado_en && (
                      <> · {new Date(selected.reembolso.procesado_en).toLocaleDateString('es-PE')}</>
                    )}
                  </p>
                  {selected.reembolso.metodo_destino && (
                    <p className="text-xs text-gray-600 mt-1">
                      Destino: {selected.reembolso.metodo_destino === 'tarjeta' ? selected.reembolso.destino_detalle : `Yape al ${selected.reembolso.destino_detalle ?? '—'}`}
                    </p>
                  )}
                </div>
                {selected.reembolso.estado === 'pendiente' && onMarkRefundProcessed && (
                  <button
                    onClick={() => onMarkRefundProcessed(selected.reembolso!.id)}
                    className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Marcar como procesado
                  </button>
                )}
              </div>
            )}

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
