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
  const [resetTarget, setResetTarget] = useState<Admin | null>(null)
  const [newPass, setNewPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [resetMsg, setResetMsg] = useState<string | null>(null)

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

  const handleResetPassword = (admin: Admin) => {
    setResetTarget(admin)
    setNewPass('')
    setShowPass(false)
    setResetMsg(null)
  }

  const submitResetPassword = async () => {
    if (!resetTarget) return
    if (newPass.length < 8) {
      setResetMsg('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    try {
      const res = await fetch(`/api/admins/${resetTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPass }),
      })
      const json = await res.json()
      if (!json.success) {
        setResetMsg(json.error || 'Error al resetear contraseña')
        return
      }
      setResetTarget(null)
    } catch (err) {
      setResetMsg(err instanceof Error ? err.message : 'Error desconocido')
    }
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

      <AdminsList
        admins={admins}
        loading={loading}
        onEdit={handleEdit}
        onToggle={handleToggle}
        onResetPassword={handleResetPassword}
      />

      {showForm && <AdminForm admin={editingAdmin} onClose={handleFormClose} />}

      {resetTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Resetear contraseña</h3>
            <p className="text-sm text-gray-600 mb-4">
              Para <span className="font-semibold">{resetTarget.nombre}</span> ({resetTarget.email}).
            </p>
            {resetMsg && (
              <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{resetMsg}</div>
            )}
            <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-16 text-sm"
                placeholder="mínimo 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-600 hover:underline"
              >
                {showPass ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setResetTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={submitResetPassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Resetear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
