'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { RuleCard } from './RuleCard'
import { RuleModal } from './RuleModal'
import { PricingRule } from './ruleHelpers'

interface Court {
  id: number
  nombre: string
  campus_id: number
  precio_default?: number | null
}

export function PricingByCourt({ courts, onRefresh }: { courts: Court[]; onRefresh: () => void }) {
  const [selectedCourt, setSelectedCourt] = useState<number | null>(courts[0]?.id ?? null)
  const [rules, setRules] = useState<PricingRule[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PricingRule | null>(null)
  const [editingDefault, setEditingDefault] = useState(false)
  const [defaultValue, setDefaultValue] = useState('')
  const dragIndex = useRef<number | null>(null)
  const [overIndex, setOverIndex] = useState<number | null>(null)

  const court = courts.find((c) => c.id === selectedCourt) ?? null

  const fetchRules = async (courtId: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pricing?court_id=${courtId}`)
      const json = await res.json()
      if (json.success) setRules(json.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedCourt) fetchRules(selectedCourt)
  }, [selectedCourt])

  // Mantener selección válida si cambian las canchas
  useEffect(() => {
    if (!courts.some((c) => c.id === selectedCourt)) setSelectedCourt(courts[0]?.id ?? null)
  }, [courts])

  const handleDrop = async () => {
    if (dragIndex.current === null || overIndex === null || dragIndex.current === overIndex) {
      dragIndex.current = null
      setOverIndex(null)
      return
    }
    const next = [...rules]
    const [moved] = next.splice(dragIndex.current, 1)
    next.splice(overIndex, 0, moved)
    setRules(next)
    dragIndex.current = null
    setOverIndex(null)
    await fetch('/api/pricing/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: next.map((r) => r.id) }),
    })
    if (selectedCourt) fetchRules(selectedCourt)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta regla?')) return
    await fetch(`/api/pricing/${id}`, { method: 'DELETE' })
    if (selectedCourt) fetchRules(selectedCourt)
  }

  const saveDefault = async () => {
    if (!selectedCourt) return
    await fetch(`/api/courts/${selectedCourt}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ precio_default: defaultValue === '' ? null : Number(defaultValue) }),
    })
    setEditingDefault(false)
    onRefresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna izquierda: selección + resumen */}
      <div className="space-y-4">
        <div>
          <label htmlFor="pricing-court-select" className="block text-sm font-medium text-gray-700 mb-2">Cancha</label>
          {courts.length === 0 ? (
            <div className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500 bg-gray-50">
              Sin registrar
            </div>
          ) : (
            <select
              id="pricing-court-select"
              value={selectedCourt ?? ''}
              onChange={(e) => setSelectedCourt(parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {courts.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Resumen</h2>
          <div className="flex justify-between text-sm py-1 border-b border-gray-200">
            <span className="text-gray-600">Precio Default</span>
            <span className="font-semibold">S/ {court?.precio_default != null ? court.precio_default.toFixed(2) : '—'}</span>
          </div>
          {rules.map((r) => (
            <div key={r.id} className="flex justify-between text-sm py-1">
              <span className="text-gray-600 truncate pr-2">{r.nombre || 'Tarifa'}</span>
              <span className="font-semibold shrink-0">S/ {r.precio.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Columna derecha: reglas */}
      <div className="lg:col-span-2 space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
          Las reglas superiores tienen mayor prioridad en caso de conflicto.
          <span className="block text-blue-600 text-xs">Arrastra las tarjetas para reordenarlas.</span>
        </div>

        {loading ? (
          <p className="text-gray-500 text-sm py-6 text-center">Cargando reglas...</p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={rule.id} className={overIndex === i ? 'ring-2 ring-green-300 rounded-lg' : ''}>
                <RuleCard
                  rule={rule}
                  index={i}
                  onEdit={() => {
                    setEditing(rule)
                    setShowModal(true)
                  }}
                  onDelete={() => handleDelete(rule.id)}
                  onDragStart={(idx) => (dragIndex.current = idx)}
                  onDragOver={(idx) => setOverIndex(idx)}
                  onDrop={handleDrop}
                />
              </div>
            ))}
            {rules.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">No hay reglas. Usa el precio default.</p>
            )}
          </div>
        )}

        <button
          onClick={() => {
            setEditing(null)
            setShowModal(true)
          }}
          disabled={!selectedCourt}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Añadir configuración
        </button>

        {/* Precio Default */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Precio Default</h2>
            {!editingDefault && (
              <button
                onClick={() => {
                  setDefaultValue(court?.precio_default != null ? String(court.precio_default) : '')
                  setEditingDefault(true)
                }}
                className="text-sm text-green-700 hover:underline"
              >
                Editar
              </button>
            )}
          </div>
          {editingDefault ? (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="number"
                min="0"
                step="0.01"
                value={defaultValue}
                onChange={(e) => setDefaultValue(e.target.value)}
                placeholder="100.00"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <button onClick={saveDefault} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                Guardar
              </button>
              <button onClick={() => setEditingDefault(false)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <p className="text-green-700 font-bold mt-1">
                S/ {court?.precio_default != null ? court.precio_default.toFixed(2) : '—'}{' '}
                <span className="text-xs font-normal text-gray-500">por hora</span>
              </p>
              <p className="text-xs text-gray-500">Se aplica cuando no hay otras reglas.</p>
            </>
          )}
        </div>
      </div>

      {showModal && selectedCourt && (
        <RuleModal
          courtId={selectedCourt}
          rule={editing}
          onClose={() => {
            setShowModal(false)
            setEditing(null)
          }}
          onSave={() => {
            setShowModal(false)
            setEditing(null)
            fetchRules(selectedCourt)
          }}
        />
      )}
    </div>
  )
}
