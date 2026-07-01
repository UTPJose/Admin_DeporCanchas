'use client'

import { useEffect, useMemo, useState } from 'react'
import { FilterBar, FilterValues } from '@/components/reservaciones/FilterBar'
import { ReservationsTable, type Reservation } from '@/components/reservaciones/ReservationsTable'
import { estadoMostrado, pasaFiltro, type FiltroReserva } from '@/lib/estado-reserva'

const LIMA_TZ = 'America/Lima'
const fmtFecha = (iso: string) =>
  new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: LIMA_TZ }).format(new Date(iso))
const fmtHora = (iso: string) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: LIMA_TZ }).format(new Date(iso))

/** Parsea "0-50" / "50-100" / "200+" / "" → [min, max] (max Infinity si "+"). */
const parsePriceRange = (s?: string): [number, number] => {
  if (!s) return [0, Infinity]
  if (s.endsWith('+')) return [Number(s.replace('+', '')) || 0, Infinity]
  const [a, b] = s.split('-').map((x) => Number(x))
  return [Number.isFinite(a) ? a : 0, Number.isFinite(b) ? b : Infinity]
}

export default function ReservacionesPage() {
  const [raw, setRaw] = useState<any[]>([])
  const [campuses, setCampuses] = useState<{ id: number; nombre: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({ status: 'todas' })
  const [refundModal, setRefundModal] = useState<Reservation | null>(null)
  const [refundNota, setRefundNota] = useState('')
  const [refundSubmitting, setRefundSubmitting] = useState(false)

  // Lista de campus para el selector del filtro
  useEffect(() => {
    fetch('/api/campus')
      .then((r) => r.json())
      .then((j) => { if (j.success) setCampuses(j.data || []) })
      .catch(() => {})
  }, [])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams()
      if (filters.dateFrom) params.append('fecha_inicio', filters.dateFrom)
      if (filters.dateTo) params.append('fecha_fin', filters.dateTo)
      if (filters.email) params.append('usuario_email', filters.email)
      params.append('limit', '100')

      const res = await fetch(`/api/reservations?${params.toString()}`)
      if (!res.ok) throw new Error('Error al cargar reservaciones')
      const data = await res.json()
      setRaw(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.dateFrom, filters.dateTo, filters.email])

  const reservations: Reservation[] = useMemo(() => {
    const filtro = (filters.status as FiltroReserva) || 'todas'
    const [pMin, pMax] = parsePriceRange(filters.price)
    const emailQ = filters.email?.trim().toLowerCase() ?? ''
    const codeQ = (filters as any).code?.trim().toUpperCase() ?? ''
    return (raw || [])
      .filter((r) => pasaFiltro(filtro, r.estado, r.fecha_termina))
      .filter((r) => {
        if (!filters.campus) return true
        const campus = r.cancha?.campus?.nombre?.toLowerCase() || ''
        return campus.includes(filters.campus.toLowerCase())
      })
      .filter((r) => {
        const p = Number(r.precio_total) || 0
        return p >= pMin && p <= pMax
      })
      .filter((r) => {
        if (!emailQ) return true
        const email = (r.usuario?.email || '').toLowerCase()
        return email.includes(emailQ)
      })
      .filter((r) => {
        if (!codeQ) return true
        return (r.code || '').toUpperCase().includes(codeQ)
      })
      .map((r) => ({
        id: r.id,
        code: r.code || '—',
        usuario_nombre: r.usuario?.nombre || '—',
        usuario_email: r.usuario?.email || '—',
        campus_nombre: r.cancha?.campus?.nombre || '—',
        cancha_nombre: r.cancha?.nombre || '—',
        fechaLabel: fmtFecha(r.fecha_empieza),
        horaLabel: `${fmtHora(r.fecha_empieza)} - ${fmtHora(r.fecha_termina)}`,
        metodoPago: r.pago?.metodo_pago || null,
        precio: r.precio_total,
        estado: estadoMostrado(r.estado, r.fecha_termina),
        reembolso: r.reembolso
          ? {
              id: r.reembolso.id,
              monto: r.reembolso.monto,
              porcentaje: r.reembolso.porcentaje,
              estado: r.reembolso.estado,
              metodo_destino: r.reembolso.metodo_destino,
              destino_detalle: r.reembolso.destino_detalle,
              procesado_en: r.reembolso.procesado_en,
            }
          : null,
      }))
  }, [raw, filters.status, filters.campus, filters.price, filters.email, (filters as any).code])

  const handleMarkRefundProcessed = (refundId: number) => {
    const r = reservations.find((x) => x.reembolso?.id === refundId)
    if (!r) return
    setRefundNota('')
    setRefundModal(r)
  }

  const confirmRefund = async () => {
    if (!refundModal?.reembolso) return
    setRefundSubmitting(true)
    try {
      const res = await fetch(`/api/reembolsos/${refundModal.reembolso.id}/procesar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota: refundNota.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Error al marcar como procesado')
      setRefundModal(null)
      fetchReservations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error')
    } finally {
      setRefundSubmitting(false)
    }
  }

  const handleCancel = async (id: number) => {
    if (!confirm('¿Cancelar esta reservación? El horario quedará libre.')) return
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al cancelar')
      fetchReservations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al cancelar')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reservaciones</h1>
        <p className="text-gray-600 mt-1">Gestión de reservas de canchas</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

      <FilterBar
        campuses={campuses}
        onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
      />

      <ReservationsTable
        data={reservations}
        loading={loading}
        onCancel={handleCancel}
        onMarkRefundProcessed={handleMarkRefundProcessed}
      />

      {refundModal?.reembolso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirmar reembolso procesado</h3>
            <p className="text-sm text-gray-600 mb-4">
              Se marcará como procesado y se enviará un correo de confirmación al cliente.
            </p>

            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm space-y-1">
              <p><span className="text-gray-500">Cliente:</span> <span className="font-medium text-gray-900">{refundModal.usuario_nombre}</span></p>
              <p><span className="text-gray-500">Correo:</span> <span className="font-medium text-gray-900">{refundModal.usuario_email}</span></p>
              <p><span className="text-gray-500">Monto:</span> <span className="font-bold text-green-700">S/ {refundModal.reembolso.monto.toFixed(2)}</span> <span className="text-gray-500">({refundModal.reembolso.porcentaje}%)</span></p>
              {refundModal.reembolso.metodo_destino && (
                <p><span className="text-gray-500">Destino:</span> <span className="font-medium text-gray-900">
                  {refundModal.reembolso.metodo_destino === 'tarjeta'
                    ? refundModal.reembolso.destino_detalle
                    : `Yape al ${refundModal.reembolso.destino_detalle ?? '—'}`}
                </span></p>
              )}
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota para el cliente <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={refundNota}
              onChange={(e) => setRefundNota(e.target.value.slice(0, 400))}
              placeholder="Ej. Transferencia realizada el 01/07 vía BCP."
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={refundSubmitting}
            />
            <p className="text-xs text-gray-400 mt-1">{refundNota.length}/400</p>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setRefundModal(null)}
                disabled={refundSubmitting}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRefund}
                disabled={refundSubmitting}
                className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
              >
                {refundSubmitting ? 'Enviando…' : 'Confirmar y notificar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
