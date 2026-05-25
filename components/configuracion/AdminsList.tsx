'use client'

import { Edit2, Power } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import type { Admin } from './AdminForm'

interface AdminsListProps {
  admins: Admin[]
  loading: boolean
  onEdit: (admin: Admin) => void
  onToggle: (admin: Admin) => void
}

export function AdminsList({ admins, loading, onEdit, onToggle }: AdminsListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    )
  }

  if (admins.length === 0) {
    return <div className="p-4 bg-gray-50 text-gray-600 rounded-lg text-sm">No hay administradores</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Celular</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Estado</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-700">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => {
            const activo = admin.estado === 'activo'
            return (
              <tr key={admin.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900">{admin.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{admin.email}</td>
                <td className="px-4 py-3 text-gray-600">{admin.celular || '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activo ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(admin)}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggle(admin)}
                      className={`p-1 rounded transition-colors ${
                        activo ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={activo ? 'Desactivar' : 'Activar'}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
