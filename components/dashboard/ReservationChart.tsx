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

  // El backend siempre devuelve los 7 días de la semana incluso con 0; aún así
  // verificamos que haya al menos 1 reserva para no mostrar una línea plana sin contexto.
  const totalSemana = data.reduce((s, d) => s + (d.reservas || 0), 0)
  const haySemana = data.length > 0
  const sinDatos = !haySemana || totalSemana === 0

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-lg font-semibold text-gray-900">Reservas pagadas por día</h3>
        <span className="text-xs text-gray-400 uppercase tracking-wide">Semana actual · Lima</span>
      </div>
      <p className="text-xs text-gray-500 mb-4">Total semana: {totalSemana}</p>
      {sinDatos ? (
        <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">
          Sin reservas pagadas esta semana.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="day" stroke="#6b7280" />
            <YAxis stroke="#6b7280" allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value} reservas`, '']}
            />
            <Line type="monotone" dataKey="reservas" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
