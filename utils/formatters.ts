import { format, formatDistance, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Formatters for dates and money
 */

// Format date to readable string
export function formatDate(date: string | Date, formatStr = 'dd/MM/yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: es })
}

// Format date and time
export function formatDateTime(date: string | Date, formatStr = 'dd/MM/yyyy HH:mm'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr, { locale: es })
}

// Format time only
export function formatTime(date: string | Date, formatStr = 'HH:mm'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}

// Format relative time (e.g., "hace 2 horas")
export function formatDistanceToNow(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(d, new Date(), { addSuffix: true, locale: es })
}

// Format money to currency
export function formatCurrency(value: number, currency = 'S/'): string {
  return `${currency} ${value.toFixed(2)}`
}

// Format percentage
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`
}

// Format large numbers with thousands separator
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 9) {
    return `+51 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  return phone
}

// Format email to lowercase
export function formatEmail(email: string): string {
  return email.toLowerCase().trim()
}
