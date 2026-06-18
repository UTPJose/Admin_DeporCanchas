'use client'

import { useEffect, useState } from 'react'
import { CourtCard } from '@/components/espacios/CourtCard'
import { CampusCard } from '@/components/espacios/CampusCard'
import { CourtModal, CourtFormData } from '@/components/espacios/CourtModal'
import { CampusModal, CampusFormData } from '@/components/espacios/CampusModal'
import { CourtTypesManager } from '@/components/espacios/CourtTypesManager'
import { tipoCanchaLabel } from '@/lib/constants'

interface TipoCancha {
  id: number
  valor: string
  etiqueta: string
  activo: boolean
}

interface Court {
  id: number
  nombre: string
  tipo_deporte: string
  campus_id: number
  cantidad_jugadores: number
  estado: 'activo' | 'mantenimiento' | 'inactivo'
  imagen_url?: string | null
  precio_default?: number | null
}

interface Campus {
  id: number
  nombre: string
  ubicacion: string
}

export default function EspaciosPage() {
  const [tab, setTab] = useState<'courts' | 'campus' | 'tipos'>('courts')
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [tipos, setTipos] = useState<TipoCancha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courtModalOpen, setCourtModalOpen] = useState(false)
  const [campusModalOpen, setCampusModalOpen] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)
  // Filtro del tab "Por Cancha": 'all' o id del campus
  const [filterCampusId, setFilterCampusId] = useState<'all' | number>('all')

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [courtsRes, campusesRes, tiposRes] = await Promise.all([
        fetch('/api/courts'),
        fetch('/api/campus'),
        fetch('/api/court-types'),
      ])

      if (!courtsRes.ok || !campusesRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const courtsData = await courtsRes.json()
      const campusesData = await campusesRes.json()
      const tiposData = await tiposRes.json()

      setCourts(courtsData.data || [])
      setCampuses(campusesData.data || [])
      setTipos(tiposData.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Tipos activos para el selector del formulario (+ resolución de etiqueta para las cards)
  const tiposActivos = tipos.filter((t) => t.activo).map((t) => ({ valor: t.valor, etiqueta: t.etiqueta }))
  const etiquetaTipo = (valor: string) =>
    tipos.find((t) => t.valor === valor)?.etiqueta ?? tipoCanchaLabel(valor)

  const refetchTipos = async () => {
    try {
      const r = await fetch('/api/court-types')
      const j = await r.json()
      if (j.success) setTipos(j.data)
    } catch {
      /* noop */
    }
  }

  const handleAddCourt = () => {
    setSelectedCourt(null)
    setCourtModalOpen(true)
  }

  const handleEditCourt = (court: Court) => {
    setSelectedCourt(court)
    setCourtModalOpen(true)
  }

  const handleDeleteCourt = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cancha?')) return
    try {
      const res = await fetch(`/api/courts/${id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Error al eliminar')
      }
      // Si fue soft-delete por tener reservas históricas, avisamos al usuario.
      if (json.mode === 'soft') alert(json.message)
      fetchData()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const handleSubmitCourt = async (data: CourtFormData) => {
    try {
      const method = selectedCourt ? 'PUT' : 'POST'
      const url = selectedCourt ? `/api/courts/${selectedCourt.id}` : '/api/courts'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar')
      fetchData()
    } catch (err) {
      throw err
    }
  }

  const handleAddCampus = () => {
    setSelectedCampus(null)
    setCampusModalOpen(true)
  }

  const handleEditCampus = (campus: Campus) => {
    setSelectedCampus(campus)
    setCampusModalOpen(true)
  }

  const handleDeleteCampus = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este campus?')) {
      try {
        const res = await fetch(`/api/campus/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar')
        fetchData()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar')
      }
    }
  }

  const handleSubmitCampus = async (data: CampusFormData) => {
    try {
      const method = selectedCampus ? 'PUT' : 'POST'
      const url = selectedCampus ? `/api/campus/${selectedCampus.id}` : '/api/campus'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar')
      fetchData()
    } catch (err) {
      throw err
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Espacios</h1>
        <p className="text-gray-600 mt-1">Gestión de campus y canchas</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">{error}</div>}

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setTab('courts')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'courts'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Cancha
        </button>
        <button
          onClick={() => setTab('campus')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'campus'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Por Campus
        </button>
        <button
          onClick={() => {
            setTab('tipos')
          }}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'tipos'
              ? 'border-green-600 text-green-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Tipos de Cancha
        </button>
      </div>

      {tab === 'courts' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <button
              onClick={handleAddCourt}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              + Agregar Cancha
            </button>

            {/* Filtro por campus */}
            <div className="flex items-center gap-2">
              <label htmlFor="filter-campus" className="text-sm text-gray-600">
                Campus:
              </label>
              <select
                id="filter-campus"
                value={filterCampusId === 'all' ? 'all' : String(filterCampusId)}
                onChange={(e) =>
                  setFilterCampusId(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
                }
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="all">Todos ({courts.length})</option>
                {campuses.map((c) => {
                  const n = courts.filter((co) => co.campus_id === c.id).length
                  return (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({n})
                    </option>
                  )
                })}
              </select>
              {filterCampusId !== 'all' && (
                <button
                  type="button"
                  onClick={() => setFilterCampusId('all')}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  limpiar
                </button>
              )}
            </div>
          </div>

          {(() => {
            const filtered =
              filterCampusId === 'all'
                ? courts
                : courts.filter((c) => c.campus_id === filterCampusId)
            if (loading) {
              return <div className="text-center py-8 text-gray-500">Cargando canchas...</div>
            }
            if (courts.length === 0) {
              return <div className="text-center py-8 text-gray-500">No hay canchas disponibles</div>
            }
            if (filtered.length === 0) {
              return (
                <div className="text-center py-8 text-gray-500">
                  No hay canchas en{' '}
                  <span className="font-semibold">
                    {campuses.find((c) => c.id === filterCampusId)?.nombre ?? 'este campus'}
                  </span>
                  .
                </div>
              )
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((court) => (
                  <CourtCard
                    key={court.id}
                    name={court.nombre}
                    sport={etiquetaTipo(court.tipo_deporte)}
                    campus={campuses.find((c) => c.id === court.campus_id)?.nombre || 'Unknown'}
                    capacity={court.cantidad_jugadores}
                    status={court.estado}
                    image={court.imagen_url ?? undefined}
                    onEdit={() => handleEditCourt(court)}
                    onDelete={() => handleDeleteCourt(court.id)}
                  />
                ))}
              </div>
            )
          })()}
        </div>
      )}

      {tab === 'campus' && (
        <div className="space-y-4">
          <button
            onClick={handleAddCampus}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            + Agregar Campus
          </button>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando campus...</div>
          ) : campuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay campus disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campuses.map((c) => (
                <CampusCard
                  key={c.id}
                  name={c.nombre}
                  location={c.ubicacion}
                  courtsCount={courts.filter((court) => court.campus_id === c.id).length}
                  reservationsCount={0}
                  onEdit={() => handleEditCampus(c)}
                  onDelete={() => handleDeleteCampus(c.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'tipos' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Tipos de cancha disponibles. Los tipos activos aparecen al crear o editar una cancha.
          </p>
          <CourtTypesManager onChange={refetchTipos} />
        </div>
      )}

      <CourtModal
        isOpen={courtModalOpen}
        onClose={() => setCourtModalOpen(false)}
        onSubmit={handleSubmitCourt}
        campuses={campuses}
        tipos={tiposActivos}
        initialData={
          selectedCourt
            ? {
                campus_id: selectedCourt.campus_id,
                nombre: selectedCourt.nombre,
                tipo_deporte: selectedCourt.tipo_deporte,
                cantidad_jugadores: selectedCourt.cantidad_jugadores,
                estado: selectedCourt.estado,
                imagen_url: selectedCourt.imagen_url ?? null,
                precio_default: selectedCourt.precio_default ?? null,
                id: selectedCourt.id,
              }
            : undefined
        }
      />

      <CampusModal
        isOpen={campusModalOpen}
        onClose={() => setCampusModalOpen(false)}
        onSubmit={handleSubmitCampus}
        initialData={
          selectedCampus
            ? {
                nombre: selectedCampus.nombre,
                ubicacion: selectedCampus.ubicacion,
                id: selectedCampus.id,
              }
            : undefined
        }
      />
    </div>
  )
}
