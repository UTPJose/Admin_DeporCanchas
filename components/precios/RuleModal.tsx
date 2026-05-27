'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { PricingRule, RuleType, DOW, ruleType } from './ruleHelpers'

interface RuleModalProps {
  courtId: number
  rule?: PricingRule | null
  onClose: () => void
  onSave: () => void
}

const TIPOS: { value: RuleType; label: string }[] = [
  { value: 'dias_horas', label: 'Días + Horas' },
  { value: 'dias', label: 'Días de la semana' },
  { value: 'fechas', label: 'Rango de fechas' },
]

export function RuleModal({ courtId, rule, onClose, onSave }: RuleModalProps) {
  const initialTipo: RuleType = rule ? (ruleType(rule) === 'general' ? 'dias_horas' : ruleType(rule)) : 'dias_horas'
  const [tipo, setTipo] = useState<RuleType>(initialTipo)
  const [nombre, setNombre] = useState(rule?.nombre ?? '')
  const [dias, setDias] = useState<number[]>(rule?.dias ?? [])
  const [horaIni, setHoraIni] = useState(rule?.hora_empieza?.slice(0, 5) ?? '18:00')
  const [horaFin, setHoraFin] = useState(rule?.hora_termina?.slice(0, 5) ?? '22:00')
  const [fechaIni, setFechaIni] = useState(rule?.fecha_empieza ?? '')
  const [fechaFin, setFechaFin] = useState(rule?.fecha_termina ?? '')
  const [precio, setPrecio] = useState(rule?.precio ?? 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleDia = (n: number) =>
    setDias((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if ((tipo === 'dias' || tipo === 'dias_horas') && dias.length === 0) {
      setError('Selecciona al menos un día.')
      return
    }
    if (tipo === 'fechas' && (!fechaIni || !fechaFin)) {
      setError('Indica el rango de fechas.')
      return
    }
    if (Number.isNaN(precio) || precio < 0) {
      setError('Ingresa un precio válido.')
      return
    }
    setLoading(true)

    try {
      const body: Record<string, unknown> = {
        court_id: courtId,
        nombre: nombre.trim() || undefined,
        dias: tipo === 'dias' || tipo === 'dias_horas' ? dias : null,
        hora_empieza: tipo === 'dias_horas' ? horaIni : null,
        hora_termina: tipo === 'dias_horas' ? horaFin : null,
        fecha_empieza: tipo === 'fechas' ? fechaIni : null,
        fecha_termina: tipo === 'fechas' ? fechaFin : null,
        precio: Number(precio),
        prioridad: rule?.prioridad ?? 0,
      }

      const url = rule ? `/api/pricing/${rule.id}` : '/api/pricing'
      const method = rule ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!json.success) {
        setError(json.error || 'Error al guardar')
        return
      }
      onSave()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{rule ? 'Editar Configuración' : 'Nueva Configuración'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Horario Nocturno, Semana de Navidad..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de regla</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as RuleType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {TIPOS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {(tipo === 'dias' || tipo === 'dias_horas') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días</label>
              <div className="flex gap-1.5 flex-wrap">
                {DOW.map((d) => (
                  <button
                    key={d.n}
                    type="button"
                    onClick={() => toggleDia(d.n)}
                    className={`px-2.5 py-1 rounded-lg text-sm border ${
                      dias.includes(d.n)
                        ? 'bg-green-600 text-white border-green-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tipo === 'dias_horas' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora inicio</label>
                <input type="time" value={horaIni} onChange={(e) => setHoraIni(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora fin</label>
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {tipo === 'fechas' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio</label>
                <input type="date" value={fechaIni} onChange={(e) => setFechaIni(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por hora (S/)</label>
            <input type="number" value={Number.isNaN(precio) ? '' : precio} min="0" step="0.01" required
              onChange={(e) => setPrecio(e.target.value === '' ? NaN : parseFloat(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
