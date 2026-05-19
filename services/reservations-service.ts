import { supabase } from '@/lib/supabase'
import { Reserva, ReservaConDetalles, ReservaFilters, SupabasePaginatedResponse } from '@/types/database'

/**
 * Reservations Service - CRUD operations para Reservas
 */

export const reservationsService = {
  /**
   * Obtener todas las reservas con filtros
   */
  async getReservations(filters?: ReservaFilters): Promise<ReservaConDetalles[]> {
    let query = supabase.from('reservas').select(
      `
        *,
        cancha:canchasdep_id (
          id,
          nombre,
          tipo_deporte,
          campus_id
        ),
        usuario:usuarios_id (
          id,
          nombre,
          email,
          celular,
          dni,
          rol:roles ( nombre )
        ),
        pago:pagos (
          id,
          monto,
          estado,
          metodo_pago,
          voucher_url
        )
      `
    )

    if (filters?.fecha_inicio) {
      query = query.gte('fecha_empieza', filters.fecha_inicio)
    }

    if (filters?.fecha_fin) {
      query = query.lte('fecha_termina', filters.fecha_fin)
    }

    if (filters?.campus_id) {
      // Join con canchas para filtrar por campus
      // Nota: Esto requeriría una consulta más compleja, por ahora se filtra después
    }

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }

    if (filters?.usuario_email) {
      // Filtro por email del usuario
      query = query.eq('usuarios.email', filters.usuario_email)
    }

    const { data, error } = await query
      .order('fecha_empieza', { ascending: false })
      .range(
        (filters?.page || 0) * (filters?.limit || 10),
        ((filters?.page || 0) + 1) * (filters?.limit || 10) - 1
      )

    if (error) throw new Error(`Error al obtener reservas: ${error.message}`)
    return data || []
  },

  /**
   * Obtener una reserva por ID
   */
  async getReservationById(id: number): Promise<ReservaConDetalles | null> {
    const { data, error } = await supabase
      .from('reservas')
      .select(
        `
        *,
        cancha:canchasdep_id (
          *,
          campus:campus_id (
            id,
            nombre,
            ubicacion
          )
        ),
        usuario:usuarios_id (
          id,
          nombre,
          email,
          celular,
          dni,
          rol:roles ( nombre )
        ),
        pagos (
          id,
          monto,
          estado,
          metodo_pago,
          voucher_url,
          voucher_serie,
          voucher_correlativo,
          comprobante_yape_url,
          card_brand,
          card_last4
        )
      `
      )
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener reserva: ${error.message}`)
    return data || null
  },

  /**
   * Crear una nueva reserva
   */
  async createReservation(reservation: Omit<Reserva, 'id' | 'creado_en'>): Promise<Reserva> {
    const { data, error } = await supabase.from('reservas').insert([reservation]).select().single()

    if (error) throw new Error(`Error al crear reserva: ${error.message}`)
    return data
  },

  /**
   * Actualizar una reserva
   */
  async updateReservation(id: number, updates: Partial<Reserva>): Promise<Reserva> {
    const { data, error } = await supabase.from('reservas').update(updates).eq('id', id).select().single()

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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('reservas')
      .select(
        `
        *,
        cancha:canchasdep_id (
          id,
          nombre,
          tipo_deporte
        )
      `
      )
      .eq('usuarios_id', userId)
      .order('fecha_empieza', { ascending: false })

    if (error) throw new Error(`Error al obtener reservas del usuario: ${error.message}`)
    return data || []
  },

  /**
   * Obtener reservas de una cancha en un período
   */
  async getCourtReservations(courtId: number, startDate: string, endDate: string): Promise<Reserva[]> {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
      .from('reservas')
      .select('precio_total')
      .gte('fecha_empieza', startDate)
      .lte('fecha_termina', endDate)
      .eq('estado', 'pagada')

    if (error) throw new Error(`Error al obtener ingresos: ${error.message}`)

    return (data || []).reduce((sum, r) => sum + r.precio_total, 0)
  },
}
