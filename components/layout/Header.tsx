'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useAuth'
import { Bell, ChevronDown } from 'lucide-react'
import { getInitials } from '@/utils/helpers'

/**
 * Header Component - Header superior del dashboard
 */

export function Header() {
  const user = useUser()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  if (!user) return null

  const initials = getInitials(user.nombre)

  return (
    <header className="bg-white border-b border-border-color h-16 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
      {/* Left: Search bar (placeholder) */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Buscar..."
          className="px-4 py-2 bg-bg-light border border-border-color rounded-lg text-sm text-text-dark placeholder-text-secondary w-64 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Right: Notifications and User Menu */}
      <div className="flex items-center gap-6 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowUserMenu(false)
            }}
            className="relative p-2 text-text-secondary hover:bg-bg-light rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-border-color rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-bold text-text-dark mb-4">Notificaciones</h3>
              <div className="space-y-3">
                <div className="p-3 bg-bg-light rounded-lg">
                  <p className="text-sm text-text-dark">No hay notificaciones nuevas</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu)
              setShowNotifications(false)
            }}
            className="flex items-center gap-2 p-2 hover:bg-bg-light rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-sm font-medium text-text-dark">{user.nombre}</p>
              <p className="text-xs text-text-secondary">{user.rol}</p>
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
                  onClick={() => {
                    window.location.href = '/login'
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-red-50 rounded transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
