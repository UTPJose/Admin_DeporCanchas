'use client'

interface ReportsFilterBarProps {
  period: 'day' | 'week' | 'month'
  startDate: string
  endDate: string
  onPeriodChange: (period: 'day' | 'week' | 'month') => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

export function ReportsFilterBar({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
}: ReportsFilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {(['day', 'week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => onPeriodChange(p)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === p
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {p === 'day' ? 'Hoy' : p === 'week' ? 'Esta Semana' : 'Este Mes'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
