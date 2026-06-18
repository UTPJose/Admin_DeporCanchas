'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface RevenueChartProps {
  data: Array<{
    date: string
    ingresos: number
  }>
  loading?: boolean
  /** Período actual controlado por el padre. */
  period: 'day' | 'week' | 'month'
  onPeriodChange: (period: 'day' | 'week' | 'month') => void
}

const LABEL: Record<RevenueChartProps['period'], string> = {
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
}

export function RevenueChart({ data, loading, period, onPeriodChange }: RevenueChartProps) {
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
        <h3 className="text-lg font-semibold text-gray-900">
          Ingresos <span className="text-sm font-normal text-gray-500">({LABEL[period]})</span>
        </h3>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          Sin ingresos en este período.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value) => `S/ ${Number(value).toFixed(2)}`}
            />
            <Area type="monotone" dataKey="ingresos" fill="#10b98133" stroke="#10b981" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
