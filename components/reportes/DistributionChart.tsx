'use client'

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'

interface DistributionChartProps {
  data: Array<{ deport: string; amount: number }>
}

const COLORS = ['#10b981', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

export function DistributionChart({ data }: DistributionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No hay datos disponibles
      </div>
    )
  }

  const formattedData = data.map((item) => ({
    name: item.deport,
    value: item.amount,
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Tooltip
          formatter={(value: any) => `S/ ${Number(value).toFixed(2)}`}
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
          }}
        />
        <Legend />
        <Pie
          data={formattedData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ percent }) => (percent && percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : '')}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {formattedData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}
