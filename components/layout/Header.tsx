'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth, useUser } from '@/hooks/useAuth'
import { Bell, ChevronDown } from 'lucide-react'
import { getInitials } from '@/utils/helpers'

/**
 * Header Component - Header superior del dashboard.
 * La campana muestra el conteo de notificaciones admin no leídas y un dropdown
 * con las 5 últimas. Las notificaciones admin son las que el cliente genera al
 * pagar o cancelar una reserva (ver `Reservas_DeporCanchas/lib/notifications`).
 */

interface AdminNotif {
  id: number
  tipo: string
  titulo: string
  mensaje: string
  leido: boolean
  creado_en: string
}

const POLL_MS = 30_000

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const s = Math.floor(ms / 1000)
  if (s < 60) return 'hace un momento'
  const m = Math.floor(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.floor(h / 24)
  return `hace ${d} d`
}

export function Header() {
  const user = useUser()
  const { logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState<AdminNotif[]>([])
  const [loading, setLoading] = useState(false)
  // Mientras se cierra sesión el botón queda deshabilitado para evitar
  // múltiples requests al endpoint de logout.
  const [loggingOut, setLoggingOut] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      // Aunque logout() redirige, por si falla resetemos el flag.
      setLoggingOut(false)
    }
  }

  // Refrescar conteo cada 30s
  useEffect(() => {
    if (!user) return
    let stop = false
    const fetchCount = async () => {
      try {
        const r = await fetch('/api/notifications?audience=admin&type=count', { cache: 'no-store' })
        const j = await r.json()
        if (!stop && j.success) setUnread(j.data?.unread_count ?? 0)
      } catch {}
    }
    fetchCount()
    const t = setInterval(fetchCount, POLL_MS)
    return () => { stop = true; clearInterval(t) }
  }, [user])

  // Cerrar dropdown al clicar fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const openBell = async () => {
    const next = !showNotifications
    setShowNotifications(next)
    setShowUserMenu(false)
    if (next) {
      setLoading(true)
      try {
        const r = await fetch('/api/notifications?audience=admin&page=1&per_page=5', { cache: 'no-store' })
        const j = await r.json()
        if (j.success) setItems(j.data?.items ?? [])
        // Marcar todo como leído cuando se abre (UX común de campana)
        await fetch('/api/notifications/admin/mark-read', { method: 'POST' }).catch(() => {})
        setUnread(0)
      } finally {
        setLoading(false)
      }
    }
  }

  if (!user) return null

  const initials = getInitials(user.nombre)

  return (
    <header className="bg-white border-b border-border-color h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
      <div className="flex items-center gap-6 ml-auto">
        {/* Notificaciones */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={openBell}
            aria-label="Ver notificaciones"
            className="relative p-2 text-text-secondary hover:bg-bg-light rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-600 text-white text-[10px] font-bold rounded-full inline-flex items-center justify-center">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-border-color rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border-color flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-dark">Notificaciones</h3>
                <Link
                  href="/notificaciones"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-green-700 hover:underline"
                >
                  Ver todas
                </Link>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-sm text-gray-500 text-center">Cargando…</div>
                ) : items.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 text-center">No hay notificaciones nuevas</div>
                ) : (
                  items.map((n) => (
                    <div key={n.id} className="px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{n.titulo}</p>
                        <span className="text-[10px] text-gray-600 whitespace-nowrap">{timeAgo(n.creado_en)}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 leading-snug">{n.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Menú usuario */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-2 hover:bg-bg-light rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-text-dark">{user.nombre}</p>
              <p className="text-xs text-text-secondary">{user.rol_nombre}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-border-color rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-border-color">
                <p className="text-sm font-medium text-text-dark">{user.nombre}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              <div className="p-2">
                <a
                  href="/configuracion"
                  className="block px-4 py-2 text-sm text-text-dark hover:bg-bg-light rounded transition-colors"
                >
                  Configuración
                </a>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
