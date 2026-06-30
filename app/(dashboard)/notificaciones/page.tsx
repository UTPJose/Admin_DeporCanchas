'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { Bell, Eye, EyeOff } from 'lucide-react'

interface AdminNotif {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  leido: boolean
  creado_en: string
}

const PER_PAGE = 20

const LIMA_FMT = new Intl.DateTimeFormat('es-PE', {
  day: '2-digit', month: '2-digit', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hour12: false,
  timeZone: 'America/Lima',
})

export default function NotificacionesPage() {
  const [items, setItems] = useState<AdminNotif[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminNotif | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  const fetchPage = async (p: number, unread: boolean) => {
    setLoading(true)
    try {
      const url = `/api/notifications?audience=admin&page=${p}&per_page=${PER_PAGE}${unread ? '&unread=true' : ''}`
      const r = await fetch(url, { cache: 'no-store' })
      const j = await r.json()
      if (j.success) {
        setItems(j.data?.items ?? [])
        setTotal(j.data?.total ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPage(page, onlyUnread)
  }, [page, onlyUnread])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7" aria-hidden="true" /> Notificaciones
          </h1>
          <p className="text-gray-600 mt-1">
            Reservas pagadas y canceladas por clientes.
          </p>
        </div>
        <button
          onClick={() => { setOnlyUnread((v) => !v); setPage(1) }}
          aria-label={onlyUnread ? 'Mostrar todas las notificaciones' : 'Mostrar solo notificaciones no leídas'}
          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          {onlyUnread ? <Eye className="w-4 h-4" aria-hidden="true" /> : <EyeOff className="w-4 h-4" aria-hidden="true" />}
          {onlyUnread ? 'Mostrar todas' : 'Solo no leídas'}
        </button>
      </div>

      <Card>
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {onlyUnread ? 'No hay notificaciones sin leer.' : 'No hay notificaciones todavía.'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => setSelected(n)}
                aria-label={n.titulo}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                  !n.leido ? 'bg-green-50/40' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      {!n.leido && <span className="w-2 h-2 bg-green-600 rounded-full" />}
                      {n.titulo}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 truncate">{n.mensaje}</p>
                  </div>
                  <span className="text-[11px] text-gray-600 whitespace-nowrap">
                    {LIMA_FMT.format(new Date(n.creado_en))}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Pager */}
      {total > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Mostrando {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} de {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Anterior
            </button>
            <span>Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900">{selected.titulo}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {LIMA_FMT.format(new Date(selected.creado_en))} · {selected.tipo}
            </p>
            <p className="mt-4 text-sm text-gray-700 leading-relaxed">{selected.mensaje}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
