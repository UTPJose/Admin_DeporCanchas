'use client'

interface ReportsFilterBarProps {
  period: 'day' | 'week' | 'month' | 'custom'
  startDate: string
  endDate: string
  onPeriodChange: (period: 'day' | 'week' | 'month' | 'custom') => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
}

function formatDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return dateStr
  } catch (e) {
    return dateStr
  }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2.5">
          {(['day', 'week', 'month', 'custom'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                period === p
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p === 'day' 
                ? 'Hoy' 
                : p === 'week' 
                  ? 'Esta Semana' 
                  : p === 'month' 
                    ? 'Este Mes' 
                    : 'Rango Personalizado'}
            </button>
          ))}
        </div>

        <div className="text-sm font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-3.5 py-1.5 rounded-lg">
          Período: <span className="text-gray-800 font-bold">{formatDate(startDate)}</span> al <span className="text-gray-800 font-bold">{formatDate(endDate)}</span>
        </div>
      </div>

      {period === 'custom' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600"
            />
          </div>
        </div>
      )}
    </div>
  )
}
