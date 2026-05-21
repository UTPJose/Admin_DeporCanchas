'use client'

import { useEffect, useState } from 'react'
import { CourtCard } from '@/components/espacios/CourtCard'
import { CampusCard } from '@/components/espacios/CampusCard'
import { CourtModal, CourtFormData } from '@/components/espacios/CourtModal'
import { CampusModal, CampusFormData } from '@/components/espacios/CampusModal'

interface Court {
  id: number
  nombre: string
  tipo_deporte: string
  campus_id: number
  cantidad_jugadores: number
  estado: 'active' | 'maintenance' | 'inactive'
}

interface Campus {
  id: number
  nombre: string
  ubicacion: string
}

export default function EspaciosPage() {
  const [tab, setTab] = useState<'courts' | 'campus'>('courts')
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [courtModalOpen, setCourtModalOpen] = useState(false)
  const [campusModalOpen, setCampusModalOpen] = useState(false)
  const [courtModalLoading, setCourtModalLoading] = useState(false)
  const [campusModalLoading, setCampusModalLoading] = useState(false)
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [courtsRes, campusesRes] = await Promise.all([fetch('/api/courts'), fetch('/api/campus')])

      if (!courtsRes.ok || !campusesRes.ok) {
        throw new Error('Error al cargar datos')
      }

      const courtsData = await courtsRes.json()
      const campusesData = await campusesRes.json()

      setCourts(courtsData.data || [])
      setCampuses(campusesData.data || [])
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

  const handleAddCourt = () => {
    setSelectedCourt(null)
    setCourtModalOpen(true)
  }

  const handleEditCourt = (court: Court) => {
    setSelectedCourt(court)
    setCourtModalOpen(true)
  }

  const handleDeleteCourt = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cancha?')) {
      try {
        const res = await fetch(`/api/courts/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Error al eliminar')
        fetchData()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Error al eliminar')
      }
    }
  }

  const handleSubmitCourt = async (data: CourtFormData) => {
    try {
      setCourtModalLoading(true)
      const method = selectedCourt ? 'PUT' : 'POST'
      const url = selectedCourt ? `/api/courts/${selectedCourt.id}` : '/api/courts'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar')
      setCourtModalOpen(false)
      fetchData()
    } catch (err) {
      throw err
    } finally {
      setCourtModalLoading(false)
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
      setCampusModalLoading(true)
      const method = selectedCampus ? 'PUT' : 'POST'
      const url = selectedCampus ? `/api/campus/${selectedCampus.id}` : '/api/campus'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Error al guardar')
      setCampusModalOpen(false)
      fetchData()
    } catch (err) {
      throw err
    } finally {
      setCampusModalLoading(false)
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
      </div>

      {tab === 'courts' && (
        <div className="space-y-4">
          <button
            onClick={handleAddCourt}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            + Agregar Cancha
          </button>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Cargando canchas...</div>
          ) : courts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay canchas disponibles</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((court) => (
                <CourtCard
                  key={court.id}
                  name={court.nombre}
                  sport={court.tipo_deporte}
                  campus={campuses.find((c) => c.id === court.campus_id)?.nombre || 'Unknown'}
                  capacity={court.cantidad_jugadores}
                  status={court.estado}
                  onEdit={() => handleEditCourt(court)}
                  onDelete={() => handleDeleteCourt(court.id)}
                />
              ))}
            </div>
          )}
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

      <CourtModal
        isOpen={courtModalOpen}
        onClose={() => setCourtModalOpen(false)}
        onSubmit={handleSubmitCourt}
        campuses={campuses}
        loading={courtModalLoading}
        initialData={
          selectedCourt
            ? {
                campus_id: selectedCourt.campus_id,
                nombre: selectedCourt.nombre,
                tipo_deporte: selectedCourt.tipo_deporte,
                cantidad_jugadores: selectedCourt.cantidad_jugadores,
                estado: selectedCourt.estado,
                id: selectedCourt.id,
              }
            : undefined
        }
      />

      <CampusModal
        isOpen={campusModalOpen}
        onClose={() => setCampusModalOpen(false)}
        onSubmit={handleSubmitCampus}
        loading={campusModalLoading}
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
