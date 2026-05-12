import { supabase } from '@/lib/supabase'
import { Tarifa, TarifasCanchaDep, TarifaFilters } from '@/types/database'

/**
 * Pricing Service - CRUD operations para Tarifas y Precios
 */

export const pricingService = {
  /**
   * Obtener todas las tarifas
   */
  async getTarifas(filters?: TarifaFilters): Promise<Tarifa[]> {
    let query = supabase.from('tarifas').select('*')

    const { data, error } = await query.order('prioridad', { ascending: false })

    if (error) throw new Error(`Error al obtener tarifas: ${error.message}`)
    return data || []
  },

  /**
   * Obtener una tarifa por ID
   */
  async getTarifaById(id: number): Promise<Tarifa | null> {
    const { data, error } = await supabase.from('tarifas').select('*').eq('id', id).single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener tarifa: ${error.message}`)
    return data || null
  },

  /**
   * Crear una nueva tarifa
   */
  async createTarifa(tarifa: Omit<Tarifa, 'id'>): Promise<Tarifa> {
    const { data, error } = await supabase.from('tarifas').insert([tarifa]).select().single()

    if (error) throw new Error(`Error al crear tarifa: ${error.message}`)
    return data
  },

  /**
   * Actualizar una tarifa
   */
  async updateTarifa(id: number, updates: Partial<Tarifa>): Promise<Tarifa> {
    const { data, error } = await supabase.from('tarifas').update(updates).eq('id', id).select().single()

    if (error) throw new Error(`Error al actualizar tarifa: ${error.message}`)
    return data
  },

  /**
   * Eliminar una tarifa
   */
  async deleteTarifa(id: number): Promise<void> {
    const { error } = await supabase.from('tarifas').delete().eq('id', id)

    if (error) throw new Error(`Error al eliminar tarifa: ${error.message}`)
  },

  /**
   * Obtener tarifas de una cancha
   */
  async getCourtTarifas(courtId: number): Promise<TarifasCanchaDep[]> {
    const { data, error } = await supabase
      .from('tarifas_canchasdep')
      .select('*, tarifas(*)')
      .eq('canchasdep_id', courtId)

    if (error) throw new Error(`Error al obtener tarifas de cancha: ${error.message}`)
    return data || []
  },

  /**
   * Asignar tarifa a cancha
   */
  async assignTarifaToCourt(
    tarifaId: number,
    courtId: number,
    precioReemplazo?: number
  ): Promise<TarifasCanchaDep> {
    const { data, error } = await supabase
      .from('tarifas_canchasdep')
      .insert([
        {
          tarifas_id: tarifaId,
          canchasdep_id: courtId,
          precio_reemplazo: precioReemplazo,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al asignar tarifa: ${error.message}`)
    return data
  },

  /**
   * Remover tarifa de cancha
   */
  async removeTarifaFromCourt(tarifaCanchaId: number): Promise<void> {
    const { error } = await supabase.from('tarifas_canchasdep').delete().eq('id', tarifaCanchaId)

    if (error) throw new Error(`Error al remover tarifa: ${error.message}`)
  },

  /**
   * Calcular precio para una reserva basado en tarifas
   */
  async calculateReservationPrice(
    courtId: number,
    startDate: string,
    endDate: string
  ): Promise<number> {
    // Este cálculo es más complejo y dependerá de tu lógica de negocio
    // Por ahora retorna 0, se implementará en FASE 4
    return 0
  },

  /**
   * Aplicar tarifa a múltiples canchas (bulk)
   */
  async applyTarifaToCourts(tarifaId: number, courtIds: number[]): Promise<void> {
    const insertData = courtIds.map((courtId) => ({
      tarifas_id: tarifaId,
      canchasdep_id: courtId,
    }))

    const { error } = await supabase.from('tarifas_canchasdep').insert(insertData)

    if (error) throw new Error(`Error al aplicar tarifa a múltiples canchas: ${error.message}`)
  },
}
