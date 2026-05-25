/**
 * Database Types — alineados con el schema real de Supabase usado por
 * `Reservas_DeporCanchas` (cliente). Ambos proyectos comparten la misma BD.
 *
 * Fuente de verdad: spec del cliente y migraciones aplicadas en Supabase.
 */

// ==================== ROLES ====================
// La BD real solo tiene 'cliente' | 'admin' en tabla roles.
// El microservicio Java los emite como 'ROLE_ADMIN' / 'ROLE_CLIENTE'.
// El tipo acepta legacy ('super_admin', 'usuario') para no romper UI existente.
export type RolNombre =
  | 'cliente' | 'admin'                       // valores reales de BD
  | 'ROLE_ADMIN' | 'ROLE_CLIENTE'             // formato Java
  | 'super_admin' | 'usuario'                 // legacy UI

export interface Rol {
  id: number
  nombre: 'cliente' | 'admin'
}

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
export type TipoDeporte = 'futbol' | 'voley' | 'basquet' | 'tenis'

export interface CanchaDep {
  id: number
  campus_id: number
  nombre: string
  tipo_deporte: TipoDeporte
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
  hora_abre: string         // HH:MM
  hora_cierra: string       // HH:MM
}

// ==================== USUARIOS ====================
// BD real: id, nombre, email, clave_hash, roles_id (FK roles), celular,
// dni (varchar(8) UNIQUE, nullable), creado_en, actualizado_en, esta_activo.
// `rol` (string) NO existe como columna; se hidrata por join a roles.nombre
// en los services.
export interface Usuario {
  id: number
  nombre: string
  email: string
  clave_hash?: string       // bcrypt — nunca exponer al cliente
  roles_id?: number         // FK roles.id (real)
  rol?: RolNombre           // hidratado por join (`roles.nombre`)
  celular?: string | null
  dni?: string | null       // varchar(8) UNIQUE, nullable
  creado_en: string
  actualizado_en?: string | null
  estaActivo: boolean
}

export interface UsuarioConRol extends Omit<Usuario, 'clave_hash'> {
  rol: RolNombre
}

// ==================== RESERVAS ====================
// Estados REALES en BD: 'pendiente' | 'pagada' | 'cancelada' | 'expirada'.
// Se mantienen los legacy ('reservado'|'finalizado'|'cancelado') en el tipo
// para que la UI existente compile; los services siempre escriben los reales.
export type ReservaEstado =
  | 'pendiente' | 'pagada' | 'cancelada' | 'expirada' | 'bloqueada'  // reales
  | 'reservado' | 'finalizado' | 'cancelado'           // legacy UI

export interface Reserva {
  id: number
  canchasdep_id: number
  usuarios_id: number
  fecha_empieza: string     // timestamptz ISO
  fecha_termina: string     // timestamptz ISO
  estado: ReservaEstado
  precio_total: number
  code?: string | null      // 8 chars, único en BD real
  expires_at?: string | null // null al pagar
  creado_en: string
}

// ==================== TARIFAS ====================
export interface Tarifa {
  id: number
  nombre: string
  hora_empieza?: string | null
  hora_termina?: string | null
  fecha_empieza?: string | null
  fecha_termina?: string | null
  precio: number
  prioridad: number
}

// ==================== TARIFAS POR CANCHA ====================
export interface TarifasCanchaDep {
  id: number
  tarifas_id: number
  canchasdep_id: number
  precio_reemplazo?: number | null
}

// ==================== PAGOS ====================
// BD real: estado ∈ pendiente|exitoso|fallido|reembolsado;
//          metodo_pago ∈ yape|plin|tarjeta. Se mantienen legacy en el tipo
//          para compat con UI; los services siempre escriben los reales.
export type PagoMetodo =
  | 'yape' | 'plin' | 'tarjeta'                       // reales
  | 'transferencia' | 'efectivo'                      // legacy UI

export type PagoEstado =
  | 'pendiente' | 'exitoso' | 'fallido' | 'reembolsado'  // reales
  | 'completado'                                          // legacy UI

export interface Pago {
  id: number
  reserva_id: number
  monto: number
  estado: PagoEstado
  metodo_pago: PagoMetodo
  simulated?: boolean

  // Voucher (lo emite el cliente al pagar; el admin solo lo lee)
  voucher_url?: string | null
  voucher_serie?: string | null
  voucher_correlativo?: number | null

  // Yape/Plin
  comprobante_yape_url?: string | null

  // Tarjeta — solo se persisten estos, nunca PAN/CVV
  card_brand?: string | null
  card_last4?: string | null
  titular_nombre?: string | null
  titular_dni?: string | null
  titular_direccion?: string | null
  titular_fecha_nacimiento?: string | null

  // Legacy / compat
  receipt_url?: string | null   // antiguo alias de voucher_url

  creado_en: string
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
// Poblado por trigger. Solo lectura desde el admin.
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
  usuario?: UsuarioConRol
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
  estado?: ReservaEstado
  page?: number
  limit?: number
}

export interface CanchaFilters {
  campus_id?: number
  tipo_deporte?: TipoDeporte
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
