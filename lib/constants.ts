/**
 * Constants - Valores constantes de la aplicación
 */

export const SITE_NAME = 'Admin DeporCanchas'
export const SITE_DESCRIPTION = 'Panel administrativo para gestión de canchas deportivas'

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8080'

// Roles — BD real: 'cliente' y 'admin' (+ legacy 'ROLE_ADMIN'/'ROLE_USER' del antiguo servicio Java).
export const ROLES = {
  ADMIN: 'admin',
  CLIENTE: 'cliente',
} as const

// Estados de reserva (BD real, único vocabulario).
export const ESTADOS_RESERVA = {
  PENDIENTE: 'pendiente',
  PAGADA: 'pagada',
  CANCELADA: 'cancelada',
  EXPIRADA: 'expirada',
} as const

// Estados de pago (BD real).
export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  EXITOSO: 'exitoso',
  FALLIDO: 'fallido',
  REEMBOLSADO: 'reembolsado',
} as const

// Estado de cancha (BD real, español).
export const ESTADOS_CANCHA = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  MANTENIMIENTO: 'mantenimiento',
} as const

// Estado de campus (BD real, español).
export const ESTADOS_CAMPUS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
} as const

// Tipos de cancha. `value` es lo que se guarda en BD (sin tildes, evita problemas
// de encoding); `label` es lo que se muestra en la UI (con tildes). El cliente
// reconoce los `value` (normaliza tildes) para tarifas/filtros. Fútbol 11 y 7 son
// tipos distintos. Lista extensible: agregar aquí habilita el tipo en el formulario.
export const TIPOS_CANCHA: { value: string; label: string }[] = [
  { value: 'Futbol 11', label: 'Fútbol 11' },
  { value: 'Futbol 7', label: 'Fútbol 7' },
  { value: 'Tenis', label: 'Tenis' },
  { value: 'Padel', label: 'Pádel' },
]

/** Etiqueta a mostrar para un tipo guardado (con tilde); si no está en la lista, devuelve el valor tal cual. */
export function tipoCanchaLabel(value: string): string {
  return TIPOS_CANCHA.find((t) => t.value === value)?.label ?? value
}

// Métodos de pago — BD real solo soporta yape | plin | tarjeta.
export const METODOS_PAGO = {
  YAPE: 'yape',
  PLIN: 'plin',
  TARJETA: 'tarjeta',
} as const

// Periodicidad
export const PERIODICIDAD = {
  NO_REPETIR: 'no_repetir',
  DIARIO: 'diario',
  SEMANAL: 'semanal',
  MENSUAL: 'mensual',
  ANUAL: 'anual',
} as const

// Horarios
export const HORA_APERTURA = 6 // 6 AM
export const HORA_CIERRE = 22 // 10 PM
export const DURACION_SLOTS = 60 // minutos

// Colores
export const COLORES = {
  PRIMARY: '#22c55e',
  PRIMARY_LIGHT: '#dcfce7',
  PRIMARY_DARK: '#16a34a',
  BG_LIGHT: '#f3f4f6',
  TEXT_DARK: '#1f2937',
  DANGER: '#ef4444',
  WARNING: '#f59e0b',
  SUCCESS: '#22c55e',
  INFO: '#3b82f6',
} as const

// Rutas
export const RUTAS = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ESPACIOS: '/espacios',
  RESERVACIONES: '/reservaciones',
  HORARIOS: '/horarios',
  PRECIOS: '/precios',
  REPORTES: '/reportes',
  CONFIGURACION: '/configuracion',
} as const

// Sidebarmenu
export const MENU_ITEMS = [
  { label: 'Panel Admin', href: RUTAS.DASHBOARD, icon: 'LayoutDashboard' },
  { label: 'Espacios', href: RUTAS.ESPACIOS, icon: 'Building2' },
  { label: 'Reservaciones', href: RUTAS.RESERVACIONES, icon: 'Calendar' },
  { label: 'Horarios', href: RUTAS.HORARIOS, icon: 'Clock' },
  { label: 'Precios', href: RUTAS.PRECIOS, icon: 'DollarSign' },
  { label: 'Reportes', href: RUTAS.REPORTES, icon: 'BarChart3' },
  { label: 'Configuración', href: RUTAS.CONFIGURACION, icon: 'Settings' },
] as const

// Paginación
export const ITEMS_PER_PAGE = 10
export const MAX_ITEMS_PER_PAGE = 100

// Tiempos
export const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutos
export const REQUEST_TIMEOUT = 10000 // 10 segundos

// Mensajes
export const MENSAJES = {
  CARGANDO: 'Cargando...',
  ERROR: 'Ocurrió un error',
  EXITO: 'Operación exitosa',
  NO_DATOS: 'No hay datos disponibles',
  CONFIRMAR: '¿Está seguro?',
  ERROR_CONEXION: 'Error de conexión',
} as const
