import { supabaseAdmin } from '@/lib/supabase'
import { Reserva, ReservaConDetalles, ReservaFilters, SupabasePaginatedResponse } from '@/types/database'

/**
 * Reservations Service - CRUD operations para Reservas
 */

export const reservationsService = {
  async getReservations(filters?: ReservaFilters): Promise<ReservaConDetalles[]> {
    // Consultar reservas base
    let query = supabaseAdmin.from('reservas').select('*')

    if (filters?.fecha_inicio) {
      query = query.gte('fecha_empieza', filters.fecha_inicio)
    }

    if (filters?.fecha_fin) {
      query = query.lte('fecha_termina', filters.fecha_fin)
    }

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    } else {
      query = query.neq('estado', 'bloqueada')
    }

    const { data: reservas, error } = await query
      .order('fecha_empieza', { ascending: false })
      .range(
        (filters?.page || 0) * (filters?.limit || 10),
        ((filters?.page || 0) + 1) * (filters?.limit || 10) - 1
      )

    console.log('[RESERVATIONS SERVICE] Reservas query error:', error)
    console.log('[RESERVATIONS SERVICE] Reservas retrieved:', reservas)

    if (error) throw new Error(`Error al obtener reservas: ${error.message}`)
    if (!reservas || reservas.length === 0) {
      console.log('[RESERVATIONS SERVICE] No reservas found, returning empty array')
      return []
    }

    // Traer usuarios relacionados
    const usuarioIds = [...new Set(reservas.map((r: any) => r.usuarios_id))]
    console.log('[RESERVATIONS SERVICE] Usuario IDs:', usuarioIds)
    
    const { data: usuarios, error: usuariosError } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, celular, dni, rol_id')
      .in('id', usuarioIds)

    console.log('[RESERVATIONS SERVICE] Usuarios query error:', usuariosError)
    console.log('[RESERVATIONS SERVICE] Usuarios retrieved:', usuarios)

    // Traer canchas relacionadas
    const canchaIds = [...new Set(reservas.map((r: any) => r.canchasdep_id))]
    console.log('[RESERVATIONS SERVICE] Cancha IDs:', canchaIds)
    
    const { data: canchas, error: canchasError } = await supabaseAdmin
      .from('canchas_deportivas')
      .select('id, nombre, tipo_deporte, campus_id')
      .in('id', canchaIds)

    console.log('[RESERVATIONS SERVICE] Canchas query error:', canchasError)
    console.log('[RESERVATIONS SERVICE] Canchas retrieved:', canchas)

    // Traer campus relacionados
    const campusIds = canchas?.map((c: any) => c.campus_id) || []
    const uniqueCampusIds = [...new Set(campusIds)]
    console.log('[RESERVATIONS SERVICE] Campus IDs:', uniqueCampusIds)
    
    const { data: campus, error: campusError } = await supabaseAdmin
      .from('campus')
      .select('id, nombre, ubicacion')
      .in('id', uniqueCampusIds)

    console.log('[RESERVATIONS SERVICE] Campus query error:', campusError)
    console.log('[RESERVATIONS SERVICE] Campus retrieved:', campus)

    // Traer pagos relacionados
    const { data: pagos, error: pagosError } = await supabaseAdmin
      .from('pagos')
      .select('id, reserva_id, monto, estado, metodo_pago, voucher_url, voucher_serie, voucher_correlativo, comprobante_yape_url')
      .in('reserva_id', reservas.map((r: any) => r.id))

    console.log('[RESERVATIONS SERVICE] Pagos query error:', pagosError)
    console.log('[RESERVATIONS SERVICE] Pagos retrieved:', pagos)

    // Mapeos para búsqueda rápida
    const usuariosMap = new Map(usuarios?.map((u: any) => [u.id, u]) || [])
    const canchasMap = new Map(canchas?.map((c: any) => [c.id, c]) || [])
    const campusMap = new Map(campus?.map((cp: any) => [cp.id, cp]) || [])
    const pagosMap = new Map(pagos?.map((p: any) => [p.reserva_id, p]) || [])

    // Combinar datos
    const result = reservas.map((r: any) => ({
      ...r,
      usuario: usuariosMap.get(r.usuarios_id),
      cancha: canchasMap.get(r.canchasdep_id),
      pago: pagosMap.get(r.id),
    }))

    console.log('[RESERVATIONS SERVICE] Final result:', result)
    return result
  },

  /**
   * Obtener una reserva por ID
   */
  async getReservationById(id: number): Promise<ReservaConDetalles | null> {
    const { data: reserva, error } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener reserva: ${error.message}`)
    if (!reserva) return null

    // Traer usuario
    const { data: usuario } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, celular, dni, rol_id')
      .eq('id', reserva.usuarios_id)
      .single()

    // Traer cancha
    const { data: cancha } = await supabaseAdmin
      .from('canchas_deportivas')
      .select('id, nombre, tipo_deporte, campus_id')
      .eq('id', reserva.canchasdep_id)
      .single()

    // Traer campus si existe cancha
    let campusData = null
    if (cancha) {
      const { data: cp } = await supabaseAdmin
        .from('campus')
        .select('id, nombre, ubicacion')
        .eq('id', cancha.campus_id)
        .single()
      campusData = cp
    }

    // Traer pagos
    const { data: pagos } = await supabaseAdmin
      .from('pagos')
      .select('id, reserva_id, monto, estado, metodo_pago, voucher_url, voucher_serie, voucher_correlativo, comprobante_yape_url')
      .eq('reserva_id', id)

    return {
      ...reserva,
      usuario,
      cancha: cancha ? { ...cancha, campus: campusData } : null,
      pagos: pagos || [],
    }
  },

  /**
   * Crear una nueva reserva
   */
  async createReservation(reservation: Omit<Reserva, 'id' | 'creado_en'>): Promise<Reserva> {
    const { data, error } = await supabaseAdmin.from('reservas').insert([reservation]).select().single()

    if (error) throw new Error(`Error al crear reserva: ${error.message}`)
    return data
  },

  /**
   * Actualizar una reserva
   */
  async updateReservation(id: number, updates: Partial<Reserva>): Promise<Reserva> {
    const { data, error } = await supabaseAdmin.from('reservas').update(updates).eq('id', id).select().single()

    if (error) throw new Error(`Error al actualizar reserva: ${error.message}`)
    return data
  },

  /**
   * Cambiar estado de una reserva
   */
  async changeReservationStatus(id: number, status: Reserva['estado']): Promise<Reserva> {
    return this.updateReservation(id, { estado: status })
  },

  /**
   * Cancelar una reserva. En BD el valor real es 'cancelada' y se libera el slot.
   */
  async cancelReservation(id: number): Promise<Reserva> {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .update({ estado: 'cancelada', expires_at: null })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Error al cancelar reserva: ${error.message}`)
    return data
  },

  /**
   * Marcar reserva como pagada (ajuste manual del admin).
   */
  async markAsPaid(id: number): Promise<Reserva> {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .update({ estado: 'pagada', expires_at: null })
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Error al marcar reserva como pagada: ${error.message}`)
    return data
  },

  /**
   * Obtener reservas de un usuario
   */
  async getUserReservations(userId: number): Promise<ReservaConDetalles[]> {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('usuarios_id', userId)
      .order('fecha_empieza', { ascending: false })

    if (error) throw new Error(`Error al obtener reservas del usuario: ${error.message}`)
    
    // Traer detalles asociados
    if (!data || data.length === 0) return []

    const canchaIds = [...new Set(data.map((r: any) => r.canchasdep_id))]
    const { data: canchas } = await supabaseAdmin
      .from('canchas_deportivas')
      .select('id, nombre, tipo_deporte, campus_id')
      .in('id', canchaIds)

    const canchasMap = new Map(canchas?.map((c: any) => [c.id, c]) || [])

    return data.map((r: any) => ({
      ...r,
      cancha: canchasMap.get(r.canchasdep_id),
    }))
  },

  /**
   * Obtener reservas de una cancha en un período
   */
  async getCourtReservations(courtId: number, startDate: string, endDate: string): Promise<Reserva[]> {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('*')
      .eq('canchasdep_id', courtId)
      .gte('fecha_empieza', startDate)
      .lte('fecha_termina', endDate)
      .in('estado', ['pagada', 'pendiente'])

    if (error) throw new Error(`Error al obtener reservas de cancha: ${error.message}`)
    return data || []
  },

  /**
   * Obtener ingresos totales en un período
   */
  async getRevenueInPeriod(startDate: string, endDate: string): Promise<number> {
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('precio_total')
      .gte('fecha_empieza', startDate)
      .lte('fecha_termina', endDate)
      .eq('estado', 'pagada')

    if (error) throw new Error(`Error al obtener ingresos: ${error.message}`)

    return (data || []).reduce((sum, r) => sum + r.precio_total, 0)
  },
}
