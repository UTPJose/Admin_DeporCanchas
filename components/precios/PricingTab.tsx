'use client'

import { PricingRuleCard } from '@/components/precios/PricingRuleCard'
import { PricingModal } from '@/components/precios/PricingModal'
import { useState } from 'react'
import { Plus } from 'lucide-react'

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

interface PricingTabProps {
  tab: 'court' | 'campus'
  courts: Court[]
  campuses: Campus[]
  selectedCourt: number | null
  selectedCampus: number | null
  pricingRules: PricingRule[]
  onCourtSelect: (courtId: number) => void
  onCampusSelect: (campusId: number) => void
  onRulesChange: () => void
}

export function PricingTab({
  tab,
  courts,
  campuses,
  selectedCourt,
  selectedCampus,
  pricingRules,
  onCourtSelect,
  onCampusSelect,
  onRulesChange,
}: PricingTabProps) {
  const [showModal, setShowModal] = useState(false)
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null)

  const handleNewRule = () => {
    setEditingRule(null)
    setShowModal(true)
  }

  const handleEditRule = (rule: PricingRule) => {
    setEditingRule(rule)
    setShowModal(true)
  }

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta regla de precios?')) return

    try {
      const response = await fetch(`/api/pricing/${ruleId}`, { method: 'DELETE' })
      const result = await response.json()
      if (result.success) {
        onRulesChange()
      }
    } catch (err) {
      console.error('Error deleting rule:', err)
    }
  }

  if (tab === 'court') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Cancha</label>
          <select
            value={selectedCourt || ''}
            onChange={(e) => onCourtSelect(parseInt(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">-- Seleccionar --</option>
            {courts.map((court) => (
              <option key={court.id} value={court.id}>
                {court.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Reglas de Precios</h3>
            <button
              onClick={handleNewRule}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
              Nueva Regla
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pricingRules.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay reglas de precios configuradas</p>
            ) : (
              pricingRules
                .sort((a, b) => a.priority - b.priority)
                .map((rule) => (
                  <PricingRuleCard
                    key={rule.id}
                    rule={rule}
                    onEdit={() => handleEditRule(rule)}
                    onDelete={() => handleDeleteRule(rule.id)}
                  />
                ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Campus</label>
        <select
          value={selectedCampus || ''}
          onChange={(e) => onCampusSelect(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        >
          <option value="">-- Seleccionar --</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actualización Masiva</h3>
        <div className="grid grid-cols-3 gap-4">
          <input
            type="number"
            placeholder="Precio base"
            min="0"
            step="0.01"
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            Aplicar a todas
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Reglas por Cancha</h3>
          <button
            onClick={handleNewRule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            Nueva Regla
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pricingRules.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay reglas de precios configuradas</p>
          ) : (
            pricingRules
              .sort((a, b) => a.priority - b.priority)
              .map((rule) => (
                <PricingRuleCard
                  key={rule.id}
                  rule={rule}
                  onEdit={() => handleEditRule(rule)}
                  onDelete={() => handleDeleteRule(rule.id)}
                />
              ))
          )}
        </div>
      </div>
    </div>
  )
}
