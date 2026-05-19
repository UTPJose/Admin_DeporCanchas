/**
 * Helper functions
 */

// Check if value is empty
export function isEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && Object.keys(value).length === 0)
  )
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Capitalize string
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

// Get color by status
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    activo: '#22c55e',
    inactivo: '#9ca3af',
    mantenimiento: '#f59e0b',
    disponible: '#22c55e',
    bloqueado: '#ef4444',
    pendiente: '#f59e0b',
    pagada: '#22c55e',
    cancelada: '#ef4444',
    expirada: '#9ca3af',
    exitoso: '#22c55e',
    fallido: '#ef4444',
    reembolsado: '#3b82f6',
    // Aliases legacy
    reservado: '#3b82f6',
    finalizado: '#22c55e',
    cancelado: '#ef4444',
    completado: '#22c55e',
  }
  return colors[status] || '#6b7280'
}

// Get badge class by status
export function getStatusBadgeClass(status: string): string {
  const classes: Record<string, string> = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-gray-100 text-gray-800',
    mantenimiento: 'bg-amber-100 text-amber-800',
    disponible: 'bg-green-100 text-green-800',
    bloqueado: 'bg-red-100 text-red-800',
    pendiente: 'bg-amber-100 text-amber-800',
    pagada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
    expirada: 'bg-gray-100 text-gray-800',
    exitoso: 'bg-green-100 text-green-800',
    fallido: 'bg-red-100 text-red-800',
    reembolsado: 'bg-blue-100 text-blue-800',
    // Aliases legacy
    reservado: 'bg-blue-100 text-blue-800',
    finalizado: 'bg-green-100 text-green-800',
    cancelado: 'bg-red-100 text-red-800',
    completado: 'bg-green-100 text-green-800',
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Debounce function
export function debounce<T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Throttle function
export function throttle<T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

// Get day of week name
export function getDayName(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[day] || ''
}

// Get month name
export function getMonthName(month: number): string {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  return months[month - 1] || ''
}

// Calculate time difference in minutes
export function calculateTimeDifference(startTime: string, endTime: string): number {
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60))
}

// Check if time is between two times
export function isTimeBetween(time: string, startTime: string, endTime: string): boolean {
  const t = new Date(`2000-01-01 ${time}`).getTime()
  const start = new Date(`2000-01-01 ${startTime}`).getTime()
  const end = new Date(`2000-01-01 ${endTime}`).getTime()
  return t >= start && t <= end
}

// Sort array by key
export function sortByKey<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...arr].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]

    if (aVal === bVal) return 0
    if (aVal === null || aVal === undefined) return 1
    if (bVal === null || bVal === undefined) return -1

    const comparison = aVal < bVal ? -1 : 1
    return order === 'asc' ? comparison : -comparison
  })
}
