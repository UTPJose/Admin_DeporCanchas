'use client'

import { useEffect, useState } from 'react'
import type { TipoCancha } from '@/services/court-types-service'

export function CourtTypesManager({ onChange }: { onChange?: () => void }) {
  const [tipos, setTipos] = useState<TipoCancha[]>([])
  const [loading, setLoading] = useState(true)
  const [nueva, setNueva] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const fetchTipos = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/court-types')
      const json = await res.json()
      if (json.success) setTipos(json.data)
      else setError(json.error || 'Error al cargar tipos')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTipos()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nueva.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/court-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etiqueta: nueva }),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'No se pudo crear')
        return
      }
      setNueva('')
      fetchTipos()
      onChange?.()
    } finally {
      setSaving(false)
    }
  }

  const patch = async (id: number, body: { etiqueta?: string; activo?: boolean }) => {
    setError(null)
    const res = await fetch(`/api/court-types/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (!json.success) {
      setError(json.error || 'No se pudo actualizar')
      return
    }
    setEditId(null)
    fetchTipos()
    onChange?.()
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={nueva}
          onChange={(e) => setNueva(e.target.value)}
          placeholder="Nuevo tipo (ej: Vóley, Básquetbol)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <button
          type="submit"
          disabled={saving || !nueva.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-50"
        >
          + Agregar tipo
        </button>
      </form>

      <p className="text-xs text-gray-500">
        Se guarda sin tildes (lo que usa la BD) y se muestra con tildes. Desactivar un tipo lo oculta
        del formulario de canchas, pero no afecta a las canchas que ya lo usan.
      </p>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {loading ? (
        <div className="text-center py-6 text-gray-500">Cargando tipos...</div>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
          {tipos.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-4 py-3 bg-white gap-3">
              {editId === t.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                  autoFocus
                />
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`font-medium ${t.activo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                    {t.etiqueta}
                  </span>
                  <span className="text-xs text-gray-400 font-mono shrink-0">({t.valor})</span>
                  {!t.activo && (
                    <span className="text-[10px] uppercase font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">
                      inactivo
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 shrink-0">
                {editId === t.id ? (
                  <>
                    <button
                      onClick={() => patch(t.id, { etiqueta: editValue })}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditId(t.id)
                        setEditValue(t.etiqueta)
                      }}
                      className="px-3 py-1 text-sm text-green-700 hover:bg-green-50 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => patch(t.id, { activo: !t.activo })}
                      className={`px-3 py-1 text-sm rounded ${
                        t.activo
                          ? 'text-amber-700 hover:bg-amber-50'
                          : 'text-green-700 hover:bg-green-50'
                      }`}
                    >
                      {t.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
