'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useState } from 'react'

interface RevenueChartProps {
  data: Array<{
    date: string
    ingresos: number
  }>
  loading?: boolean
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void
}

export function RevenueChart({ data, loading, onPeriodChange }: RevenueChartProps) {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

  const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
    setPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const formatDateLabel = (dateStr: any) => {
    if (typeof dateStr !== 'string' || !dateStr) return ''
    try {
      const parts = dateStr.split('-')
      const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10) - 1
        const day = parseInt(parts[2], 10)
        return `${day} ${MONTHS_ES[month].toLowerCase()}`
      }
      if (parts.length === 2) {
        const month = parseInt(parts[1], 10) - 1
        return MONTHS_ES[month]
      }
      return dateStr
    } catch {
      return dateStr
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-400">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ingresos</h3>
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af" 
            tickFormatter={formatDateLabel} 
            tickLine={false}
            axisLine={false}
            dy={10}
            minTickGap={45}
            style={{ fontSize: '12px', fontFamily: 'sans-serif' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tickLine={false}
            axisLine={false}
            dx={-5}
            tickFormatter={(value) => `S/ ${value}`}
            style={{ fontSize: '12px', fontFamily: 'sans-serif' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
            labelFormatter={formatDateLabel}
            formatter={(value) => [`S/ ${Number(value).toLocaleString('es-PE')}`, 'Ingresos']}
          />
          <Area 
            type="monotone" 
            dataKey="ingresos" 
            fill="url(#colorIngresos)" 
            stroke="#10b981" 
            strokeWidth={3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
