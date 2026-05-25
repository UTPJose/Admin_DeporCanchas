import { supabaseAdmin } from '@/lib/supabase'

/**
 * Court Types Service - CRUD de tipos de cancha (tabla `tipos_cancha`).
 * `valor` es lo que se guarda en `canchas_deportivas.tipo_deporte` (sin tildes,
 * evita problemas de encoding); `etiqueta` es lo que se muestra (con tildes).
 */

export interface TipoCancha {
  id: number
  valor: string
  etiqueta: string
  activo: boolean
  creado_en?: string
}

/** Deriva el `valor` (sin tildes, espacios colapsados) a partir de la etiqueta. */
export function valorDesdeEtiqueta(etiqueta: string): string {
  return etiqueta
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita diacríticos (tildes)
    .replace(/\s+/g, ' ')
    .trim()
}

export const courtTypesService = {
  async getTypes(onlyActive = false): Promise<TipoCancha[]> {
    let query = supabaseAdmin.from('tipos_cancha').select('*').order('id', { ascending: true })
    if (onlyActive) query = query.eq('activo', true)
    const { data, error } = await query
    if (error) throw new Error(`Error al obtener tipos de cancha: ${error.message}`)
    return data || []
  },

  async createType(etiqueta: string): Promise<TipoCancha> {
    const limpia = etiqueta.replace(/\s+/g, ' ').trim()
    if (limpia.length < 2) throw new Error('La etiqueta es demasiado corta.')
    const valor = valorDesdeEtiqueta(limpia)

    // Unicidad por `valor` (ignora tildes): "Pádel" y "Padel" colisionan.
    const { data: existing } = await supabaseAdmin
      .from('tipos_cancha')
      .select('id')
      .eq('valor', valor)
      .maybeSingle()
    if (existing) throw new Error('Ya existe un tipo de cancha equivalente.')

    const { data, error } = await supabaseAdmin
      .from('tipos_cancha')
      .insert({ valor, etiqueta: limpia, activo: true })
      .select()
      .single()
    if (error) throw new Error(`Error al crear tipo de cancha: ${error.message}`)
    return data
  },

  async updateType(
    id: number,
    updates: { etiqueta?: string; activo?: boolean }
  ): Promise<TipoCancha> {
    // OJO: `valor` es inmutable. Cambiarlo dejaría huérfanas las canchas que ya
    // guardan ese tipo en `tipo_deporte`. Solo se editan etiqueta (display) y activo.
    const patch: Record<string, unknown> = {}
    if (typeof updates.activo === 'boolean') patch.activo = updates.activo
    if (typeof updates.etiqueta === 'string') {
      const limpia = updates.etiqueta.replace(/\s+/g, ' ').trim()
      if (limpia.length < 2) throw new Error('La etiqueta es demasiado corta.')
      patch.etiqueta = limpia
    }
    if (Object.keys(patch).length === 0) throw new Error('Nada que actualizar.')

    const { data, error } = await supabaseAdmin
      .from('tipos_cancha')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error(`Error al actualizar tipo de cancha: ${error.message}`)
    return data
  },
}
