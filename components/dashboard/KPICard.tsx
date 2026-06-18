'use client'

import { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  /** % de variación. Si es `null` no se muestra. */
  trend?: number | null
  trendLabel?: string
  /** Subtítulo bajo el valor (ej.: "Histórico", "Este mes") para evitar
   *  confusiones sobre qué mide el número. */
  subtitle?: string
  /** Si true, en vez del % muestra una etiqueta "Nuevo" (el período anterior era 0). */
  previousEmpty?: boolean
}

export function KPICard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  subtitle,
  previousEmpty,
}: KPICardProps) {
  const hasTrend = trend !== undefined && trend !== null
  const isTrendPositive = hasTrend && trend! > 0
  const isTrendNegative = hasTrend && trend! < 0
  const trendClass = isTrendPositive
    ? 'text-green-600'
    : isTrendNegative
      ? 'text-red-600'
      : 'text-gray-600'

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">{subtitle}</p>
          )}
          {previousEmpty && trendLabel ? (
            <p className="text-sm mt-2 text-blue-600 font-medium">
              ★ Nuevo · {trendLabel}
            </p>
          ) : hasTrend && trendLabel ? (
            <p className={`text-sm mt-2 ${trendClass}`}>
              {isTrendPositive ? '↑' : isTrendNegative ? '↓' : '→'} {Math.abs(trend!).toFixed(1)}% {trendLabel}
            </p>
          ) : null}
        </div>
        <div className="flex-shrink-0 text-green-600">{icon}</div>
      </div>
    </div>
  )
}
