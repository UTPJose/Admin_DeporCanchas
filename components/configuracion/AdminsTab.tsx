'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { AdminsList } from '@/components/configuracion/AdminsList'
import { AdminForm } from '@/components/configuracion/AdminForm'

interface Admin {
  id: number
  username: string
  email: string
  nombre: string
  estado: string
}

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
    try {
      const response = await fetch('/api/auth/admins')
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

  const handleDelete = async (adminId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este administrador?')) return

    try {
      const response = await fetch(`/api/auth/admins/${adminId}`, { method: 'DELETE' })
      const result = await response.json()

      if (result.success) {
        fetchAdmins()
      } else {
        setError(result.error || 'Error al eliminar')
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
        <h3 className="text-lg font-semibold text-gray-900">Lista de Administradores</h3>
        <button
          onClick={() => {
            setEditingAdmin(null)
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-4 h-4" />
          Nuevo Administrador
        </button>
      </div>

      <AdminsList admins={admins} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />

      {showForm && <AdminForm admin={editingAdmin} onClose={handleFormClose} />}
    </div>
  )
}
