'use client'

import { useEffect, useState } from 'react'
import { FilterBar, FilterValues } from '@/components/reservaciones/FilterBar'
import { ReservationsTable } from '@/components/reservaciones/ReservationsTable'

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

export default function ReservacionesPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterValues>({})

  const fetchReservations = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.append('dateTo', filters.dateTo)
      if (filters.status) params.append('status', filters.status)
      if (filters.email) params.append('email', filters.email)

      const res = await fetch(`/api/reservations?${params.toString()}`)

      if (!res.ok) throw new Error('Error al cargar reservaciones')

      const data = await res.json()
      setReservations(
        data.data?.map((r: any) => ({
          id: r.id,
          usuario_nombre: r.usuario?.nombre || 'Unknown',
          usuario_email: r.usuario?.email || 'unknown@example.com',
          campus_nombre: r.cancha?.campus?.nombre || 'Unknown',
          cancha_nombre: r.cancha?.nombre || 'Unknown',
          fecha: r.fecha,
          hora_inicio: r.hora_inicio,
          precio: r.precio,
          estado: r.estado || 'pendiente',
        })) || []
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReservations()
  }, [filters])

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus }),
      })

      if (!res.ok) throw new Error('Error al actualizar')
      fetchReservations()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const handleCancel = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas cancelar esta reservación?')) {
      try {
        const res = await fetch(`/api/reservations/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) throw new Error('Error al cancelar')
        fetchReservations()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al cancelar')
      }
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

      <ReservationsTable
        data={reservations}
        loading={loading}
        onStatusChange={handleStatusChange}
        onCancel={handleCancel}
      />
    </div>
  )
}
