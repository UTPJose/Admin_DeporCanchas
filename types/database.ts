/**
 * Database Types - Generados desde schema PostgreSQL de Supabase
 * Mapeo automático de tablas a tipos TypeScript
 *
 * Basado en: schema.txt
 */

// ==================== CAMPUS ====================
export interface Campus {
  id: number
  nombre: string
  ubicacion: string
  estado: 'activo' | 'inactivo' | 'mantenimiento'
  created_at?: string
  updated_at?: string
}

// ==================== CANCHAS DEPORTIVAS ====================
export interface CanchaDep {
  id: number
  campus_id: number
  nombre: string
  tipo_deporte: 'futbol' | 'voley' | 'basquet' | 'tenis'
  cantidad_jugadores: number
  estado: 'disponible' | 'bloqueado' | 'mantenimiento'
  created_at?: string
  updated_at?: string
}

// ==================== DISPONIBILIDAD DE CANCHAS ====================
export interface CanchaDisponibilidad {
  id: number
  canchasdep_id: number
  dias_de_la_semana: number // 0-6 (domingo-sábado)
  hora_abre: string // HH:MM
  hora_cierra: string // HH:MM
}

// ==================== USUARIOS ====================
export interface Usuario {
  id: number
  nombre: string
  email: string
  clave?: string | null
  rol: 'admin' | 'super_admin' | 'usuario' | string
  celular?: string | null
  creado_en: string
  actualizado_en?: string | null
  estaActivo: boolean
}

// ==================== RESERVAS ====================
export interface Reserva {
  id: number
  canchasdep_id: number
  usuarios_id: number
  fecha_empieza: string // ISO 8601
  fecha_termina: string // ISO 8601
  estado: 'reservado' | 'finalizado' | 'cancelado' | 'pendiente'
  precio_total: number
  creado_en: string
  code?: string | null
  expires_at?: string | null
}

// ==================== TARIFAS ====================
export interface Tarifa {
  id: number
  nombre: string
  hora_empieza?: string | null // HH:MM
  hora_termina?: string | null // HH:MM
  fecha_empieza?: string | null // YYYY-MM-DD
  fecha_termina?: string | null // YYYY-MM-DD
  precio: number
  prioridad: number // 0-100, mayor = mayor prioridad
}

// ==================== TARIFAS POR CANCHA ====================
export interface TarifasCanchaDep {
  id: number
  tarifas_id: number
  canchasdep_id: number
  precio_reemplazo?: number | null
}

// ==================== PAGOS ====================
export interface Pago {
  id: number
  reserva_id: number
  monto: number
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado'
  metodo_pago: 'tarjeta' | 'transferencia' | 'efectivo'
  creado_en: string
  receipt_url?: string | null
  card_brand?: string | null
  card_last4?: string | null
  simulated: boolean
}

// ==================== NOTIFICACIONES ====================
export interface Notificacion {
  id: number
  usuarios_id: number
  tipo: string
  titulo: string
  mensaje: string
  leido: boolean
  creado_en: string
}

// ==================== HISTORIAL DE RESERVAS ====================
export interface HistorialReserva {
  id: number
  reservas_id: number
  accion?: string | null
  data_anterior?: Record<string, unknown> | null
  data_nuevo?: Record<string, unknown> | null
  ultimo_cambio_en: string
}

// ==================== TIPOS COMPUESTOS ====================

export interface ReservaConDetalles extends Reserva {
  cancha?: CanchaDep & { campus?: Campus }
  usuario?: Usuario
  pago?: Pago | null
}

export interface CanchaConDetalles extends CanchaDep {
  campus?: Campus
  disponibilidades?: CanchaDisponibilidad[]
  tarifas?: TarifasCanchaDep[]
}

export interface CampusConDetalles extends Campus {
  canchas?: CanchaDep[]
  cantidad_canchas?: number
  cantidad_reservas?: number
}

// ==================== STATISTICS ====================

export interface DashboardStats {
  total_usuarios: number
  total_reservas: number
  total_ingresos: number
  total_pendientes: number
  reservas_por_dia?: { dia: string; cantidad: number }[]
  ingresos_por_periodo?: { periodo: string; monto: number }[]
}

// ==================== QUERY FILTERS ====================

export interface ReservaFilters {
  fecha_inicio?: string
  fecha_fin?: string
  campus_id?: number
  cancha_id?: number
  usuario_email?: string
  precio_min?: number
  precio_max?: number
  estado?: Reserva['estado']
  page?: number
  limit?: number
}

export interface CanchaFilters {
  campus_id?: number
  tipo_deporte?: CanchaDep['tipo_deporte']
  estado?: CanchaDep['estado']
  page?: number
  limit?: number
}

export interface TarifaFilters {
  cancha_id?: number
  campus_id?: number
  page?: number
  limit?: number
}

// ==================== SUPABASE GENERIC TYPES ====================

export interface SupabaseResponse<T> {
  data: T | null
  error: SupabaseError | null
}

export interface SupabaseError {
  message: string
  details: string
  hint: string
  code: string
}

export interface SupabasePaginatedResponse<T> {
  data: T[]
  count: number
  error: SupabaseError | null
}
