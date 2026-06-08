'use client'

interface FilterBarProps {
  campuses?: { id: number; nombre: string }[]
  onFilterChange?: (filters: FilterValues) => void
}

export interface FilterValues {
  dateFrom?: string
  dateTo?: string
  campus?: string
  court?: string
  price?: string
  status?: string
  email?: string
  code?: string
}

export function FilterBar({ campuses = [], onFilterChange }: FilterBarProps) {
  const handleChange = (field: keyof FilterValues, value: string) => {
    onFilterChange?.({
      [field]: value,
    } as FilterValues)
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Código</label>
          <input
            type="text"
            placeholder="Ej: A1B2C3D4"
            onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
            className="w-full px-2 py-1 text-sm font-mono uppercase border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600 placeholder:font-sans placeholder:normal-case"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Desde</label>
          <input
            type="date"
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Hasta</label>
          <input
            type="date"
            onChange={(e) => handleChange('dateTo', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
          <select
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="todas">Todas</option>
            <option value="programadas">Programadas</option>
            <option value="finalizadas">Finalizadas</option>
            <option value="pendientes">Pendientes</option>
            <option value="canceladas">Canceladas</option>
            <option value="expiradas">No completadas</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Campus</label>
          <select
            onChange={(e) => handleChange('campus', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="">Todos</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.nombre}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Email..."
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Precio</label>
          <select
            onChange={(e) => handleChange('price', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-600"
          >
            <option value="">Todos</option>
            <option value="0-50">S/ 0 - 50</option>
            <option value="50-100">S/ 50 - 100</option>
            <option value="100-200">S/ 100 - 200</option>
            <option value="200+">S/ 200+</option>
          </select>
        </div>
      </div>
    </div>
  )
}
