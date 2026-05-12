'use client'

interface StatusBadgeProps {
  status: string
}

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  reservado: { bg: 'bg-violet-100', text: 'text-violet-700', label: 'Reservado' },
  finalizado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Finalizado' },
  cancelado: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelado' },
  pendiente: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendiente' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || statusConfig.pendiente

  return <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>{config.label}</span>
}
