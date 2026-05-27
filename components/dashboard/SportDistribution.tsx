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

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Deporte</h3>
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
    </div>
  )
}
