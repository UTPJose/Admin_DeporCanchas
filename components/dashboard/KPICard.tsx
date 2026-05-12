'use client'

import { ReactNode } from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: number
  trendLabel?: string
}

export function KPICard({ title, value, icon, trend, trendLabel }: KPICardProps) {
  const isTrendPositive = trend && trend > 0
  const trendClass = isTrendPositive ? 'text-green-600' : trend && trend < 0 ? 'text-red-600' : 'text-gray-600'

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {trend !== undefined && trendLabel && (
            <p className={`text-sm mt-2 ${trendClass}`}>
              {isTrendPositive ? '↑' : trend && trend < 0 ? '↓' : '→'} {Math.abs(trend)}% {trendLabel}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-green-600">{icon}</div>
      </div>
    </div>
  )
}
