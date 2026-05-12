import { supabase } from '@/lib/supabase'
import { CanchaDep, CanchaConDetalles, CanchaFilters } from '@/types/database'

/**
 * Courts Service - CRUD operations para Canchas Deportivas
 */

export const courtsService = {
  /**
   * Obtener todas las canchas
   */
  async getCourts(filters?: CanchaFilters): Promise<CanchaDep[]> {
    let query = supabase.from('canchas_deportivas').select('*')

    if (filters?.campus_id) {
      query = query.eq('campus_id', filters.campus_id)
    }

    if (filters?.tipo_deporte) {
      query = query.eq('tipo_deporte', filters.tipo_deporte)
    }

    if (filters?.estado) {
      query = query.eq('estado', filters.estado)
    }

    const { data, error } = await query.order('nombre', { ascending: true })

    if (error) throw new Error(`Error al obtener canchas: ${error.message}`)
    return data || []
  },

  /**
   * Obtener una cancha por ID con todos sus detalles
   */
  async getCourtById(id: number): Promise<CanchaConDetalles | null> {
    const { data, error } = await supabase
      .from('canchas_deportivas')
      .select(
        `
        *,
        campus:campus_id (
          id,
          nombre,
          ubicacion,
          estado
        ),
        cancha_disponibilidad (
          id,
          dias_de_la_semana,
          hora_abre,
          hora_cierra
        ),
        tarifas_canchasdep:tarifas_canchasdep (
          id,
          tarifas_id,
          precio_reemplazo
        )
      `
      )
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener cancha: ${error.message}`)
    return data || null
  },

  /**
   * Crear una nueva cancha
   */
  async createCourt(court: Omit<CanchaDep, 'id' | 'created_at' | 'updated_at'>): Promise<CanchaDep> {
    const { data, error } = await supabase.from('canchas_deportivas').insert([court]).select().single()

    if (error) throw new Error(`Error al crear cancha: ${error.message}`)
    return data
  },

  /**
   * Actualizar una cancha
   */
  async updateCourt(id: number, updates: Partial<CanchaDep>): Promise<CanchaDep> {
    const { data, error } = await supabase.from('canchas_deportivas').update(updates).eq('id', id).select().single()

    if (error) throw new Error(`Error al actualizar cancha: ${error.message}`)
    return data
  },

  /**
   * Eliminar una cancha
   */
  async deleteCourt(id: number): Promise<void> {
    const { error } = await supabase.from('canchas_deportivas').delete().eq('id', id)

    if (error) throw new Error(`Error al eliminar cancha: ${error.message}`)
  },

  /**
   * Obtener canchas por campus
   */
  async getCourtsByCampus(campusId: number): Promise<CanchaDep[]> {
    return this.getCourts({ campus_id: campusId })
  },

  /**
   * Obtener estadísticas de una cancha
   */
  async getCourtStats(id: number): Promise<{
    total_reservas: number
    total_ingresos: number
    proximo_horario_disponible?: string
    tasa_ocupacion: number
  }> {
    const { data: reservas, error } = await supabase
      .from('reservas')
      .select('id, precio_total, fecha_empieza')
      .eq('canchasdep_id', id)
      .eq('estado', 'reservado')

    if (error) throw new Error(`Error al obtener estadísticas: ${error.message}`)

    const total_ingresos = (reservas || []).reduce((sum, r) => sum + r.precio_total, 0)

    return {
      total_reservas: reservas?.length || 0,
      total_ingresos,
      tasa_ocupacion: 0, // Se calculará después con datos de horarios
    }
  },
}
