'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PricingByCourt } from '@/components/precios/PricingByCourt'
import { PricingByCampus } from '@/components/precios/PricingByCampus'

interface Court {
  id: number
  nombre: string
  campus_id: number
  precio_default?: number | null
}

interface Campus {
  id: number
  nombre: string
}

export default function PreciosPage() {
  const [tab, setTab] = useState<'court' | 'campus'>('court')
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [courtsRes, campusRes] = await Promise.all([fetch('/api/courts'), fetch('/api/campus')])
      const courtsJson = await courtsRes.json()
      const campusJson = await campusRes.json()
      if (courtsJson.success) setCourts(courtsJson.data || [])
      if (campusJson.success) {
        setCampuses(campusJson.data || [])
        if (campusJson.data?.length && selectedCampus === null) setSelectedCampus(campusJson.data[0].id)
      }
    } catch {
      setError('Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredCourts = courts.filter((c) => c.campus_id === selectedCampus)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Precios</h1>
        <p className="text-gray-600 mt-1">Configura precios y reglas por cancha o campus</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab('court')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                tab === 'court' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Por Cancha
            </button>
            <button
              onClick={() => setTab('campus')}
              className={`px-4 py-2 rounded-lg font-medium text-sm ${
                tab === 'campus' ? 'bg-green-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Por Campus
            </button>
          </div>

          {/* Selector de campus (compartido) */}
          <div className="max-w-xs">
            <label htmlFor="precios-campus" className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
            <select
              id="precios-campus"
              value={selectedCampus ?? ''}
              onChange={(e) => setSelectedCampus(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : tab === 'court' ? (
            <PricingByCourt courts={filteredCourts} onRefresh={fetchData} />
          ) : (
            <PricingByCampus courts={filteredCourts} onRefresh={fetchData} />
          )}
        </div>
      </Card>
    </div>
  )
}
