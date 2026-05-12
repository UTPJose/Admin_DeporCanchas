import { supabase } from '@/lib/supabase'
import { CanchaDisponibilidad } from '@/types/database'

/**
 * Schedules Service - CRUD operations para Horarios y Bloqueos
 */

export const schedulesService = {
  /**
   * Obtener disponibilidad de una cancha
   */
  async getCourtAvailability(courtId: number): Promise<CanchaDisponibilidad[]> {
    const { data, error } = await supabase
      .from('cancha_disponibilidad')
      .select('*')
      .eq('canchasdep_id', courtId)
      .order('dias_de_la_semana', { ascending: true })

    if (error) throw new Error(`Error al obtener disponibilidad: ${error.message}`)
    return data || []
  },

  /**
   * Crear disponibilidad para una cancha
   */
  async createAvailability(
    courtId: number,
    dayOfWeek: number,
    startTime: string,
    endTime: string
  ): Promise<CanchaDisponibilidad> {
    const { data, error } = await supabase
      .from('cancha_disponibilidad')
      .insert([
        {
          canchasdep_id: courtId,
          dias_de_la_semana: dayOfWeek,
          hora_abre: startTime,
          hora_cierra: endTime,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al crear disponibilidad: ${error.message}`)
    return data
  },

  /**
   * Actualizar disponibilidad
   */
  async updateAvailability(
    id: number,
    updates: Partial<CanchaDisponibilidad>
  ): Promise<CanchaDisponibilidad> {
    const { data, error } = await supabase
      .from('cancha_disponibilidad')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar disponibilidad: ${error.message}`)
    return data
  },

  /**
   * Eliminar disponibilidad
   */
  async deleteAvailability(id: number): Promise<void> {
    const { error } = await supabase.from('cancha_disponibilidad').delete().eq('id', id)

    if (error) throw new Error(`Error al eliminar disponibilidad: ${error.message}`)
  },

  /**
   * Obtener horarios bloqueados de una cancha en una semana
   */
  async getBlockedSchedules(courtId: number, weekStart: string, weekEnd: string): Promise<any[]> {
    // Los horarios bloqueados se almacenan como reservas con estado especial
    // Esta es una aproximación, la lógica exacta dependerá de tu implementación
    const { data, error } = await supabase
      .from('reservas')
      .select('fecha_empieza, fecha_termina, estado')
      .eq('canchasdep_id', courtId)
      .gte('fecha_empieza', weekStart)
      .lte('fecha_termina', weekEnd)

    if (error) throw new Error(`Error al obtener horarios bloqueados: ${error.message}`)
    return data || []
  },

  /**
   * Bloquear un horario en una cancha
   */
  async blockSchedule(
    courtId: number,
    startDate: string,
    endDate: string,
    reason?: string
  ): Promise<any> {
    // Crea una "reserva" especial que marca el bloqueo
    const { data, error } = await supabase
      .from('reservas')
      .insert([
        {
          canchasdep_id: courtId,
          usuarios_id: 0, // Usuario especial para bloqueos
          fecha_empieza: startDate,
          fecha_termina: endDate,
          estado: 'bloqueado',
          precio_total: 0,
          code: `BLOCK_${Date.now()}`,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al bloquear horario: ${error.message}`)
    return data
  },

  /**
   * Desbloquear un horario
   */
  async unblockSchedule(scheduleId: number): Promise<void> {
    const { error } = await supabase.from('reservas').delete().eq('id', scheduleId)

    if (error) throw new Error(`Error al desbloquear horario: ${error.message}`)
  },

  /**
   * Verificar si un horario está disponible
   */
  async isTimeSlotAvailable(
    courtId: number,
    startDate: string,
    endDate: string
  ): Promise<boolean> {
    const { count, error } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('canchasdep_id', courtId)
      .or(`and(gte(fecha_empieza,${startDate}),lte(fecha_empieza,${endDate}))`)

    if (error) throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    return (count || 0) === 0
  },
}
