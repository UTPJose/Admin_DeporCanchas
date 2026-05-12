'use client'

import { DollarSign, TrendingUp, Calendar, BarChart3, ArrowUp, ArrowDown } from 'lucide-react'

interface RevenueCardProps {
  label: string
  value: string
  icon: 'DollarSign' | 'TrendingUp' | 'Calendar' | 'BarChart3'
  trend?: number
  isPercentage?: boolean
}

export function RevenueCard({ label, value, icon, trend, isPercentage }: RevenueCardProps) {
  const icons: Record<string, any> = {
    DollarSign,
    TrendingUp,
    Calendar,
    BarChart3,
  }

  const Icon = icons[icon]
  const trendColor = trend ? (trend > 0 ? 'text-green-600' : 'text-red-600') : undefined
  const TrendIcon = trend && trend > 0 ? ArrowUp : trend && trend < 0 ? ArrowDown : null

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && trend !== 0 && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trendColor}`}>
              {TrendIcon && <TrendIcon className="w-4 h-4" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-green-100 rounded-lg">
          <Icon className="w-6 h-6 text-green-600" />
        </div>
      </div>
    </div>
  )
}
