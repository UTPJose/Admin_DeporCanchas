'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReservationChartProps {
  data: Array<{
    day: string
    reservas: number
  }>
  loading?: boolean
  days?: number
  onDaysChange?: (days: number) => void
}

export function ReservationChart({ data, loading, days = 7, onDaysChange }: ReservationChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-400">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Reservas por Día</h3>
        <div className="flex gap-2">
          {([5, 7, 10] as const).map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange?.(d)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                days === d ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d} días
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#9ca3af" 
            tickLine={false}
            axisLine={false}
            dy={10}
            interval={0}
            minTickGap={0}
            style={{ fontSize: '10px', fontFamily: 'sans-serif' }}
          />
          <YAxis 
            stroke="#9ca3af" 
            tickLine={false}
            axisLine={false}
            dx={-5}
            style={{ fontSize: '12px', fontFamily: 'sans-serif' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
            }}
            formatter={(value) => [`${value} reservas`, 'Reservas']}
          />
          <Line 
            type="monotone" 
            dataKey="reservas" 
            stroke="#10b981" 
            strokeWidth={3} 
            dot={{ r: 4, strokeWidth: 1, fill: '#10b981' }} 
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
