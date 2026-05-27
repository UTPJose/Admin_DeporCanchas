'use client'

import { useState } from 'react'
import { DOW, RuleType } from './ruleHelpers'

interface Court {
  id: number
  nombre: string
  campus_id: number
  precio_default?: number | null
}

const TIPOS: { value: RuleType; label: string }[] = [
  { value: 'dias_horas', label: 'Días + Horas' },
  { value: 'dias', label: 'Días de la semana' },
  { value: 'fechas', label: 'Rango de fechas' },
]

export function PricingByCampus({ courts, onRefresh }: { courts: Court[]; onRefresh: () => void }) {
  const [selected, setSelected] = useState<number[]>([])
  const [defaultPrice, setDefaultPrice] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  // Inyección
  const [tipo, setTipo] = useState<RuleType>('fechas')
  const [nombre, setNombre] = useState('')
  const [dias, setDias] = useState<number[]>([])
  const [horaIni, setHoraIni] = useState('18:00')
  const [horaFin, setHoraFin] = useState('22:00')
  const [fechaIni, setFechaIni] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [precio, setPrecio] = useState('')

  const allSelected = courts.length > 0 && selected.length === courts.length
  const toggle = (id: number) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  const toggleAll = () => setSelected(allSelected ? [] : courts.map((c) => c.id))
  const toggleDia = (n: number) => setDias((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]))

  const flash = (setter: (v: string | null) => void, text: string) => {
    setter(text)
    setTimeout(() => setter(null), 4000)
  }

  const applyDefault = async () => {
    setErr(null)
    if (!selected.length || defaultPrice === '') return
    const res = await fetch('/api/pricing/default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ court_ids: selected, precio_default: Number(defaultPrice) }),
    })
    const json = await res.json()
    if (!json.success) return flash(setErr, json.error || 'Error')
    flash(setMsg, `Precio default aplicado a ${json.data.canchas} cancha(s).`)
    onRefresh()
  }

  const applyInject = async () => {
    setErr(null)
    if (!selected.length || precio === '') return flash(setErr, 'Selecciona canchas y un precio.')
    if ((tipo === 'dias' || tipo === 'dias_horas') && dias.length === 0) return flash(setErr, 'Selecciona días.')
    if (tipo === 'fechas' && (!fechaIni || !fechaFin)) return flash(setErr, 'Indica el rango de fechas.')

    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        court_ids: selected,
        nombre: nombre.trim() || undefined,
        dias: tipo === 'dias' || tipo === 'dias_horas' ? dias : null,
        hora_empieza: tipo === 'dias_horas' ? horaIni : null,
        hora_termina: tipo === 'dias_horas' ? horaFin : null,
        fecha_empieza: tipo === 'fechas' ? fechaIni : null,
        fecha_termina: tipo === 'fechas' ? fechaFin : null,
        precio: Number(precio),
      }),
    })
    const json = await res.json()
    if (!json.success) return flash(setErr, json.error || 'Error')
    flash(setMsg, `Regla copiada como primera en ${json.data.canchas} cancha(s).`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Checklist de canchas */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">Canchas</label>
          <button onClick={toggleAll} className="text-sm text-green-700 hover:underline">
            {allSelected ? 'Quitar todas' : 'Seleccionar todas'}
          </button>
        </div>
        <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-80 overflow-y-auto">
          {courts.map((c) => (
            <label key={c.id} className="flex items-center gap-2 cursor-pointer text-sm">
              <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
              {c.nombre}
            </label>
          ))}
          {courts.length === 0 && <p className="text-gray-500 text-sm">No hay canchas en este campus.</p>}
        </div>
        <p className="text-xs text-gray-500 mt-2">{selected.length} de {courts.length} seleccionadas</p>
      </div>

      {/* Acciones */}
      <div className="lg:col-span-2 space-y-6">
        {msg && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{msg}</div>}
        {err && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{err}</div>}

        {/* Actualización masiva default */}
        <div className="border border-gray-200 rounded-lg p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Actualización Masiva Default</h3>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo precio default por hora</label>
          <input type="number" min="0" step="0.01" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)}
            placeholder="100.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-3" />
          <button onClick={applyDefault} disabled={!selected.length || defaultPrice === ''}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-300">
            Aplicar a {selected.length} cancha(s) seleccionada(s)
          </button>
        </div>

        {/* Inyección de configuración */}
        <div className="border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Inyección de Configuración</h3>
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs">
            Las configuraciones aplicadas se copiarán como reglas independientes en cada cancha seleccionada (queda primera).
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de regla</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as RuleType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre (opcional)</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Semana de Navidad" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          {(tipo === 'dias' || tipo === 'dias_horas') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Días</label>
              <div className="flex gap-1.5 flex-wrap">
                {DOW.map((d) => (
                  <button key={d.n} type="button" onClick={() => toggleDia(d.n)}
                    className={`px-2.5 py-1 rounded-lg text-sm border ${
                      dias.includes(d.n) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300'
                    }`}>{d.l}</button>
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
            <input type="number" min="0" step="0.01" value={precio} onChange={(e) => setPrecio(e.target.value)}
              placeholder="120.00" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>

          <button onClick={applyInject} disabled={!selected.length || precio === ''}
            className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:bg-gray-300">
            Aplicar configuración a {selected.length} cancha(s)
          </button>
        </div>
      </div>
    </div>
  )
}
