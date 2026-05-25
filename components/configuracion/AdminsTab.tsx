'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { AdminsList } from '@/components/configuracion/AdminsList'
import { AdminForm, type Admin } from '@/components/configuracion/AdminForm'

export function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admins')
      const result = await response.json()
      if (result.success) {
        setAdmins(result.data || [])
      } else {
        setError(result.error || 'Error al cargar administradores')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (admin: Admin) => {
    const nextActivo = admin.estado !== 'activo'
    const accion = nextActivo ? 'activar' : 'desactivar'
    if (!confirm(`¿Deseas ${accion} a ${admin.nombre}?`)) return
    try {
      const response = await fetch(`/api/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ esta_activo: nextActivo }),
      })
      const result = await response.json()
      if (result.success) {
        fetchAdmins()
      } else {
        setError(result.error || 'Error al actualizar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingAdmin(null)
    fetchAdmins()
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Administradores</h3>
        <button
          onClick={() => {
            setEditingAdmin(null)
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo administrador
        </button>
      </div>

      <AdminsList admins={admins} loading={loading} onEdit={handleEdit} onToggle={handleToggle} />

      {showForm && <AdminForm admin={editingAdmin} onClose={handleFormClose} />}
    </div>
  )
}
