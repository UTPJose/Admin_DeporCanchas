/**
 * Constants - Valores constantes de la aplicación
 */

export const SITE_NAME = 'Admin DeporCanchas'
export const SITE_DESCRIPTION = 'Panel administrativo para gestión de canchas deportivas'

// API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
export const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:8080'

// Roles
export const ROLES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  USUARIO: 'usuario',
} as const

// Estados
export const ESTADOS_RESERVA = {
  RESERVADO: 'reservado',
  FINALIZADO: 'finalizado',
  CANCELADO: 'cancelado',
  PENDIENTE: 'pendiente',
} as const

export const ESTADOS_PAGO = {
  PENDIENTE: 'pendiente',
  COMPLETADO: 'completado',
  FALLIDO: 'fallido',
  REEMBOLSADO: 'reembolsado',
} as const

export const ESTADOS_CANCHA = {
  DISPONIBLE: 'disponible',
  BLOQUEADO: 'bloqueado',
  MANTENIMIENTO: 'mantenimiento',
} as const

export const ESTADOS_CAMPUS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  MANTENIMIENTO: 'mantenimiento',
} as const

// Deportes
export const DEPORTES = {
  FUTBOL: 'futbol',
  VOLEY: 'voley',
  BASQUET: 'basquet',
  TENIS: 'tenis',
} as const

// Métodos de pago
export const METODOS_PAGO = {
  TARJETA: 'tarjeta',
  TRANSFERENCIA: 'transferencia',
  EFECTIVO: 'efectivo',
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
