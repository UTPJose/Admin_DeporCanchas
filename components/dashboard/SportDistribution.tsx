'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SportDistributionProps {
  data: Array<{
    name: string
    value: number
  }>
  loading?: boolean
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

export function SportDistribution({ data, loading }: SportDistributionProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 h-80 flex items-center justify-center">
        <div className="text-gray-400">Cargando datos...</div>
      </div>
    )
  }

  const total = data.reduce((s, d) => s + (d.value || 0), 0)

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Reservas por Deporte</h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide">Cantidad</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Reservas pagadas y pendientes · Total: {total}</p>
      {total === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          Sin reservas para distribuir.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => (percent && percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} reservas`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
