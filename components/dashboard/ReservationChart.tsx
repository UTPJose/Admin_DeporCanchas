'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface ReservationChartProps {
  data: Array<{
    day: string
    reservas: number
  }>
  loading?: boolean
}

export function ReservationChart({ data, loading }: ReservationChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-400">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Día</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="day" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Line type="monotone" dataKey="reservas" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
