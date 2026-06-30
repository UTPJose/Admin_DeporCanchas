'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { MENU_ITEMS, RUTAS } from '@/lib/constants'
import {
  LayoutDashboard,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react'

/**
 * Sidebar Component - Navegación lateral del dashboard
 */

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  Calendar: <Calendar className="w-5 h-5" />,
  Clock: <Clock className="w-5 h-5" />,
  DollarSign: <DollarSign className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
}

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  // Guard anti doble-click mientras se cierra sesión.
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <aside className="w-64 bg-white border-r border-border-color h-screen overflow-y-auto fixed left-0 top-0 shadow-sm">
      {/* Logo */}
      <div className="p-6 border-b border-border-color">
        <h1 className="text-xl font-bold text-text-dark">DeporCanchas</h1>
        <p className="text-xs text-text-secondary">Panel Admin</p>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-light text-green-800 font-medium'
                  : 'text-text-dark hover:bg-bg-light'
              }`}
            >
              {iconMap[item.icon]}
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border-color bg-white">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-danger hover:bg-red-50 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          <span>{loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}</span>
        </button>
      </div>
    </aside>
  )
}
