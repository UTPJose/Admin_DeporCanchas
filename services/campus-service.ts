import { supabase } from '@/lib/supabase'
import { Campus, CampusConDetalles, CanchaFilters } from '@/types/database'

/**
 * Campus Service - CRUD operations para Campus
 */

export const campusService = {
  /**
   * Obtener todos los campus
   */
  async getCampus(): Promise<Campus[]> {
    const { data, error } = await supabase.from('campus').select('*').order('nombre', { ascending: true })

    if (error) throw new Error(`Error al obtener campus: ${error.message}`)
    return data || []
  },

  /**
   * Obtener un campus por ID con sus canchas
   */
  async getCampusById(id: number): Promise<CampusConDetalles | null> {
    const { data, error } = await supabase
      .from('campus')
      .select(
        `
        *,
        canchas_deportivas (
          id,
          nombre,
          tipo_deporte,
          cantidad_jugadores,
          estado
        )
      `
      )
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener campus: ${error.message}`)
    return data || null
  },

  /**
   * Crear un nuevo campus
   */
  async createCampus(campus: Omit<Campus, 'id' | 'created_at' | 'updated_at'>): Promise<Campus> {
    const { data, error } = await supabase.from('campus').insert([campus]).select().single()

    if (error) throw new Error(`Error al crear campus: ${error.message}`)
    return data
  },

  /**
   * Actualizar un campus
   */
  async updateCampus(id: number, updates: Partial<Campus>): Promise<Campus> {
    const { data, error } = await supabase.from('campus').update(updates).eq('id', id).select().single()

    if (error) throw new Error(`Error al actualizar campus: ${error.message}`)
    return data
  },

  /**
   * Eliminar un campus
   */
  async deleteCampus(id: number): Promise<void> {
    const { error } = await supabase.from('campus').delete().eq('id', id)

    if (error) throw new Error(`Error al eliminar campus: ${error.message}`)
  },

  /**
   * Obtener estadísticas de un campus
   */
  async getCampusStats(id: number): Promise<{
    cantidad_canchas: number
    cantidad_reservas: number
    ingresos_totales: number
  }> {
    const { data: canchas, error: e1 } = await supabase
      .from('canchas_deportivas')
      .select('id', { count: 'exact', head: true })
      .eq('campus_id', id)

    const { data: reservas, error: e2 } = await supabase
      .from('reservas')
      .select('id, precio_total', { head: false })
      .in(
        'canchasdep_id',
        (await supabase.from('canchas_deportivas').select('id').eq('campus_id', id)).data?.map((c) => c.id) || []
      )

    const ingresos_totales = (reservas || []).reduce((sum, r) => sum + r.precio_total, 0)

    return {
      cantidad_canchas: canchas?.length || 0,
      cantidad_reservas: reservas?.length || 0,
      ingresos_totales,
    }
  },
}
