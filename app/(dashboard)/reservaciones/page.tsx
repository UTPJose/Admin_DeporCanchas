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

export default function ReservacionesPage() {
  const [raw, setRaw] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({ status: 'todas' })

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
    return (raw || [])
      .filter((r) => pasaFiltro(filtro, r.estado, r.fecha_termina))
      .filter((r) => {
        if (!filters.campus) return true
        const campus = r.cancha?.campus?.nombre?.toLowerCase() || ''
        return campus.includes(filters.campus.toLowerCase())
      })
      .map((r) => ({
        id: r.id,
        usuario_nombre: r.usuario?.nombre || '—',
        usuario_email: r.usuario?.email || '—',
        campus_nombre: r.cancha?.campus?.nombre || '—',
        cancha_nombre: r.cancha?.nombre || '—',
        fechaLabel: fmtFecha(r.fecha_empieza),
        horaLabel: `${fmtHora(r.fecha_empieza)} - ${fmtHora(r.fecha_termina)}`,
        metodoPago: r.pago?.metodo_pago || null,
        precio: r.precio_total,
        estado: estadoMostrado(r.estado, r.fecha_termina),
      }))
  }, [raw, filters.status, filters.campus])

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

      <FilterBar onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })} />

      <ReservationsTable data={reservations} loading={loading} onCancel={handleCancel} />
    </div>
  )
}
