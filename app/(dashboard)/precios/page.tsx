'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PricingTab } from '@/components/precios/PricingTab'

interface PricingRule {
  id: number
  court_id?: number
  campus_id?: number
  day_of_week?: number
  start_time?: string
  end_time?: string
  base_price: number
  discount_percentage?: number
  priority: number
  active: boolean
}

interface Court {
  id: number
  nombre: string
  campus_id: number
}

interface Campus {
  id: number
  nombre: string
}

export default function PreciosPage() {
  const [activeTab, setActiveTab] = useState<'court' | 'campus'>('court')
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCampuses()
    fetchCourts()
  }, [])

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campus')
      const result = await response.json()
      if (result.success) {
        setCampuses(result.data)
      }
    } catch (err) {
      setError('Error al cargar campus')
    }
  }

  const fetchCourts = async () => {
    try {
      const response = await fetch('/api/courts')
      const result = await response.json()
      if (result.success) {
        setCourts(result.data)
      }
    } catch (err) {
      setError('Error al cargar canchas')
    }
  }

  const fetchPricingRules = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab === 'court' && selectedCourt) {
        params.append('court_id', selectedCourt.toString())
      } else if (activeTab === 'campus' && selectedCampus) {
        params.append('campus_id', selectedCampus.toString())
      }

      const response = await fetch(`/api/pricing?${params}`)
      const result = await response.json()
      if (result.success) {
        setPricingRules(result.data || [])
      }
    } catch (err) {
      setError('Error al cargar tarifas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if ((activeTab === 'court' && selectedCourt) || (activeTab === 'campus' && selectedCampus)) {
      fetchPricingRules()
    }
  }, [activeTab, selectedCourt, selectedCampus])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Precios</h1>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('court')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'court'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Por Cancha
            </button>
            <button
              onClick={() => setActiveTab('campus')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'campus'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Por Campus
            </button>
          </div>

          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <PricingTab
              tab={activeTab}
              courts={courts}
              campuses={campuses}
              selectedCourt={selectedCourt}
              selectedCampus={selectedCampus}
              pricingRules={pricingRules}
              onCourtSelect={setSelectedCourt}
              onCampusSelect={setSelectedCampus}
              onRulesChange={fetchPricingRules}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
