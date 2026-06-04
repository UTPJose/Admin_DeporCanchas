'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/common/Card'
import { ProfileTab } from '@/components/configuracion/ProfileTab'
import { AdminsTab } from '@/components/configuracion/AdminsTab'
import { useAuth } from '@/hooks/useAuth'

export default function ConfiguracionPage() {
  const { user } = useAuth()
  const isSuper = !!user?.isSuper
  const [activeTab, setActiveTab] = useState<'profile' | 'admins'>('profile')

  // Si el usuario deja de ser super y estaba parado en Administradores, volver a Perfil.
  useEffect(() => {
    if (!isSuper && activeTab === 'admins') setActiveTab('profile')
  }, [isSuper, activeTab])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Gestiona tu perfil y administradores del sistema</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-green-600 text-green-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Mi Perfil
            </button>
            {isSuper && (
              <button
                onClick={() => setActiveTab('admins')}
                className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                  activeTab === 'admins'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Administradores
              </button>
            )}
          </div>

          {activeTab === 'profile' && <ProfileTab />}
          {activeTab === 'admins' && isSuper && <AdminsTab />}
        </div>
      </Card>
    </div>
  )
}
