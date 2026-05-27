'use client'

import { Trash2, Edit2, GripVertical, Calendar, Clock } from 'lucide-react'
import {
  PricingRule,
  RULE_TYPE_LABEL,
  ruleType,
  hourLabel,
  dateLabel,
  dowLabel,
} from './ruleHelpers'

interface RuleCardProps {
  rule: PricingRule
  index: number
  onEdit: () => void
  onDelete: () => void
  onDragStart: (index: number) => void
  onDragOver: (index: number) => void
  onDrop: () => void
}

export function RuleCard({ rule, index, onEdit, onDelete, onDragStart, onDragOver, onDrop }: RuleCardProps) {
  const tipo = ruleType(rule)
  const horas = hourLabel(rule)
  const fechas = dateLabel(rule)

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => {
        e.preventDefault()
        onDragOver(index)
      }}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow flex items-start gap-3"
    >
      <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 pt-0.5" title="Arrastrar para reordenar">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900 truncate">{rule.nombre || 'Tarifa'}</span>
          <div className="flex gap-1 shrink-0">
            <button onClick={onEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded" title="Editar">
              <Edit2 className="w-4 h-4" />
            </button>
            <button onClick={onDelete} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Eliminar">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <span className="inline-block mt-1 text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
          {RULE_TYPE_LABEL[tipo]}
        </span>

        {rule.dias && rule.dias.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {rule.dias.map((d) => (
              <span key={d} className="text-[11px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                {dowLabel(d)}
              </span>
            ))}
          </div>
        )}

        {horas && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {horas}
          </div>
        )}

        {fechas && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {fechas}
          </div>
        )}

        <p className="mt-2 text-green-700 font-bold">
          S/ {rule.precio.toFixed(2)} <span className="text-xs font-normal text-gray-500">por hora</span>
        </p>
      </div>
    </div>
  )
}
