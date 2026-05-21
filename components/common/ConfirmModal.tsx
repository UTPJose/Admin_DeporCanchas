'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/common/Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null

  const typeColors = {
    danger: {
      bg: 'bg-red-50 text-red-600',
      btn: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-600',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
    info: {
      bg: 'bg-blue-50 text-blue-600',
      btn: 'bg-green-600 hover:bg-green-700 text-white', // verde es primario por AGENTS.md
    },
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-[100] transition-opacity duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 border border-gray-100 transform transition-all duration-200 scale-100">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${typeColors[type].bg} shrink-0`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-lg font-bold text-gray-900 leading-6">{title}</h3>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            {cancelText}
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${typeColors[type].btn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
