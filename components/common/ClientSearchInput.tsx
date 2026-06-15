'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X, UserCircle2 } from 'lucide-react'

export interface ClientSearchValue {
  id: number
  nombre: string
  email: string
}

interface ClientSearchInputProps {
  /** Cliente seleccionado actualmente (null = ninguno) */
  value: ClientSearchValue | null
  onChange: (value: ClientSearchValue | null) => void
  placeholder?: string
  label?: string
  /** Endpoint de búsqueda. Debe responder { success, data: ClientSearchValue[] }. */
  endpoint?: string
  /** Mínimo de chars antes de buscar */
  minChars?: number
  /** Debounce ms */
  debounceMs?: number
}

/**
 * Combobox de búsqueda de clientes. Pide al servidor con debounce y muestra
 * las top N coincidencias (nombre o email). Cuando hay un seleccionado se
 * muestra como "chip" arriba; el input queda oculto hasta que se limpia con la X.
 *
 * Escala con muchos clientes porque NUNCA carga la lista completa: cada
 * consulta hace `ilike` en server y devuelve hasta 10.
 */
export function ClientSearchInput({
  value,
  onChange,
  placeholder = 'Buscar por nombre o correo…',
  label,
  endpoint = '/api/usuarios/search',
  minChars = 2,
  debounceMs = 250,
}: ClientSearchInputProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ClientSearchValue[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Cerrar al click-out
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current) return
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Búsqueda con debounce
  useEffect(() => {
    if (value) return // mientras hay seleccionado no buscamos
    if (query.trim().length < minChars) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    setOpen(true)
    const id = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort()
      const ctrl = new AbortController()
      abortRef.current = ctrl
      try {
        const url = `${endpoint}?q=${encodeURIComponent(query.trim())}&limit=10`
        const r = await fetch(url, { signal: ctrl.signal })
        const j = await r.json()
        if (j.success) {
          setResults(j.data || [])
          setHighlight(0)
        }
      } catch {
        // ignorar (abort o red)
      } finally {
        setLoading(false)
      }
    }, debounceMs)
    return () => clearTimeout(id)
  }, [query, value, minChars, debounceMs, endpoint])

  const select = (c: ClientSearchValue) => {
    onChange(c)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const clear = () => {
    onChange(null)
    setQuery('')
    setResults([])
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(results.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const c = results[highlight]
      if (c) select(c)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      )}

      {value ? (
        <div className="flex items-center gap-2 border border-green-300 bg-green-50 rounded-lg px-3 py-2 text-sm">
          <UserCircle2 className="w-4 h-4 text-green-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-green-900 truncate">{value.nombre}</p>
            <p className="text-xs text-green-700/80 truncate">{value.email}</p>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="Quitar filtro de cliente"
            className="p-1 rounded hover:bg-green-100 text-green-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => query.length >= minChars && setOpen(true)}
            placeholder={placeholder}
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600"
            autoComplete="off"
          />
          {open && (results.length > 0 || loading || (query.trim().length >= minChars && !loading)) && (
            <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
              {loading && (
                <div className="px-3 py-2 text-xs text-gray-500">Buscando…</div>
              )}
              {!loading && results.length === 0 && (
                <div className="px-3 py-2 text-xs text-gray-500">
                  Sin resultados para “{query.trim()}”.
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => select(r)}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 text-sm border-b last:border-b-0 border-gray-100 ${
                    i === highlight ? 'bg-green-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <UserCircle2 className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">{r.nombre}</p>
                    <p className="text-xs text-gray-500 truncate">{r.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
