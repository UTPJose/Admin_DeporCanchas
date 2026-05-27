import { supabaseAdmin as supabase } from '@/lib/supabase'
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

  // ==================== REGLAS DE PRECIO (tarifa + enlace a cancha) ====================
  // Una "regla" = una fila en `tarifas` + su enlace en `tarifas_canchasdep`. El cliente
  // (calcularPrecioReserva) elige por hora la tarifa de MENOR `prioridad` que cumpla
  // día + rango de hora + rango de fecha. precio efectivo = precio_reemplazo ?? tarifas.precio.
  // Si nada matchea, usa `canchas_deportivas.precio_default`.

  async getCourtPricingRules(courtId: number): Promise<PricingRule[]> {
    const { data, error } = await supabase
      .from('tarifas_canchasdep')
      .select('precio_reemplazo, tarifas(*)')
      .eq('canchasdep_id', courtId)
    if (error) throw new Error(`Error al obtener reglas de la cancha: ${error.message}`)
    return (data || [])
      .filter((r) => r.tarifas)
      .map((r) => mapRule(r))
      .sort((a, b) => a.prioridad - b.prioridad)
  },

  async createCourtPricingRule(courtId: number, data: PricingRuleInput): Promise<Tarifa> {
    // Nueva regla al final (mayor número = menor prioridad)
    const rules = await this.getCourtPricingRules(courtId)
    const maxP = rules.reduce((m, r) => Math.max(m, r.prioridad), 0)
    return insertRuleForCourt(courtId, { ...data, prioridad: maxP + 1 })
  },

  /**
   * Inyecta una regla como copia INDEPENDIENTE en cada cancha seleccionada,
   * colocada PRIMERA (mayor prioridad = menor número) en cada una.
   */
  async injectRuleToCourts(courtIds: number[], data: PricingRuleInput): Promise<number> {
    if (!courtIds.length) throw new Error('Selecciona al menos una cancha.')
    for (const courtId of courtIds) {
      const rules = await this.getCourtPricingRules(courtId)
      const minP = rules.reduce((m, r) => Math.min(m, r.prioridad), 1)
      await insertRuleForCourt(courtId, { ...data, prioridad: minP - 1 })
    }
    return courtIds.length
  },

  async updatePricingRule(tarifaId: number, data: PricingRuleInput): Promise<Tarifa> {
    const { data: tarifa, error } = await supabase
      .from('tarifas')
      .update(toTarifaRow(data))
      .eq('id', tarifaId)
      .select()
      .single()
    if (error) throw new Error(`Error al actualizar regla: ${error.message}`)
    return tarifa
  },

  async deletePricingRule(tarifaId: number): Promise<void> {
    // Primero los enlaces (FK), luego la tarifa
    await supabase.from('tarifas_canchasdep').delete().eq('tarifas_id', tarifaId)
    const { error } = await supabase.from('tarifas').delete().eq('id', tarifaId)
    if (error) throw new Error(`Error al eliminar regla: ${error.message}`)
  },

  /** Reordena por arrastre: el orden recibido define la prioridad (1 = arriba = gana). */
  async reorderRules(orderedTarifaIds: number[]): Promise<void> {
    for (let i = 0; i < orderedTarifaIds.length; i++) {
      const { error } = await supabase
        .from('tarifas')
        .update({ prioridad: i + 1 })
        .eq('id', orderedTarifaIds[i])
      if (error) throw new Error(`Error al reordenar: ${error.message}`)
    }
  },

  /** Fija el precio_default en varias canchas (actualización masiva del campus). */
  async bulkSetDefault(courtIds: number[], precio: number): Promise<void> {
    if (!courtIds.length) throw new Error('Selecciona al menos una cancha.')
    const { error } = await supabase
      .from('canchas_deportivas')
      .update({ precio_default: precio })
      .in('id', courtIds)
    if (error) throw new Error(`Error al actualizar precio default: ${error.message}`)
  },
}

export interface PricingRule {
  id: number
  nombre: string
  dias?: number[] | null
  hora_empieza?: string | null
  hora_termina?: string | null
  fecha_empieza?: string | null
  fecha_termina?: string | null
  precio: number
  prioridad: number
}

export interface PricingRuleInput {
  nombre?: string
  dias?: number[] | null
  hora_empieza?: string | null
  hora_termina?: string | null
  fecha_empieza?: string | null
  fecha_termina?: string | null
  precio: number
  prioridad: number
}

/** Inserta una tarifa y su enlace a la cancha. */
async function insertRuleForCourt(courtId: number, data: PricingRuleInput): Promise<Tarifa> {
  const { data: tarifa, error } = await supabase
    .from('tarifas')
    .insert([toTarifaRow(data)])
    .select()
    .single()
  if (error) throw new Error(`Error al crear regla: ${error.message}`)
  const { error: linkErr } = await supabase
    .from('tarifas_canchasdep')
    .insert([{ tarifas_id: tarifa.id, canchasdep_id: courtId }])
  if (linkErr) throw new Error(`Error al enlazar la regla a la cancha: ${linkErr.message}`)
  return tarifa
}

function mapRule(row: { precio_reemplazo?: number | null; tarifas: any }): PricingRule {
  const t = Array.isArray(row.tarifas) ? row.tarifas[0] : row.tarifas
  return {
    id: t.id,
    nombre: t.nombre,
    dias: t.dias ?? null,
    hora_empieza: t.hora_empieza,
    hora_termina: t.hora_termina,
    fecha_empieza: t.fecha_empieza,
    fecha_termina: t.fecha_termina,
    precio: row.precio_reemplazo ?? t.precio,
    prioridad: t.prioridad,
  }
}

/** Normaliza el input de UI a una fila de `tarifas` (nombre por defecto si falta). */
function toTarifaRow(data: PricingRuleInput) {
  return {
    nombre: data.nombre?.trim() || 'Tarifa',
    dias: data.dias && data.dias.length ? data.dias : null,
    hora_empieza: data.hora_empieza || null,
    hora_termina: data.hora_termina || null,
    fecha_empieza: data.fecha_empieza || null,
    fecha_termina: data.fecha_termina || null,
    precio: data.precio,
    prioridad: data.prioridad,
  }
}
