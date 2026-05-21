'use client'

import { Trash2, Edit2 } from 'lucide-react'

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

interface PricingRuleCardProps {
  rule: PricingRule
  onEdit: () => void
  onDelete: () => void
}

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function PricingRuleCard({ rule, onEdit, onDelete }: PricingRuleCardProps) {
  const dayName = rule.day_of_week !== undefined ? DAYS[rule.day_of_week] : 'Todos los días'
  const timeRange = rule.start_time && rule.end_time ? `${rule.start_time} - ${rule.end_time}` : 'Todo el día'
  const basePrice = rule.base_price ?? 0
  const finalPrice = rule.discount_percentage
    ? basePrice * (1 - rule.discount_percentage / 100)
    : basePrice

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-900">{dayName}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{timeRange}</span>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
              Prioridad {rule.priority}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Precio base:</span>
              <span className="ml-2 font-semibold text-gray-900">${basePrice.toFixed(2)}</span>
            </div>
            {rule.discount_percentage && (
              <>
                <div>
                  <span className="text-gray-600">Descuento:</span>
                  <span className="ml-2 font-semibold text-gray-900">{rule.discount_percentage}%</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Precio final:</span>
                  <span className="ml-2 font-semibold text-green-600">${finalPrice.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
