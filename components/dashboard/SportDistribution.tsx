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
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const getPercentage = (value: number) => {
    if (total === 0) return '0%'
    return `${((value / total) * 100).toFixed(0)}%`
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reservas por Deporte</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${getPercentage(value)} (${value})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `${value} reservas (${getPercentage(Number(value))})`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
