import { supabaseAdmin } from '@/lib/supabase'
import { CanchaDisponibilidad } from '@/types/database'
import { sanitizeDatetime } from '@/utils/helpers'

/**
 * Schedules Service - CRUD operations para Horarios y Bloqueos
 */

export const schedulesService = {
  /**
   * Obtener disponibilidad de una cancha
   */
  async getCourtAvailability(courtId: number): Promise<CanchaDisponibilidad[]> {
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
    const { error } = await supabaseAdmin.from('cancha_disponibilidad').delete().eq('id', id)

    if (error) throw new Error(`Error al eliminar disponibilidad: ${error.message}`)
  },

  /**
   * Obtener horarios bloqueados de una cancha en una semana
   */
  async getBlockedSchedules(courtId: number, weekStart: string, weekEnd: string): Promise<any[]> {
    // Los horarios bloqueados se almacenan como reservas con estado especial
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('id, canchasdep_id, fecha_empieza, fecha_termina, estado, code, usuarios(email)')
      .eq('canchasdep_id', courtId)
      .in('estado', ['pendiente', 'pagada', 'bloqueada'])
      .gte('fecha_empieza', `${weekStart}T00:00:00Z`)
      .lte('fecha_termina', `${weekEnd}T23:59:59Z`)

    if (error) throw new Error(`Error al obtener horarios bloqueados: ${error.message}`)
    
    // Mapear los campos de la BD a los nombres de propiedad que espera el calendario de la UI
    return (data || []).map(reserva => {
      const isManualBlock = reserva.estado === 'bloqueada'
      return {
        id: reserva.id,
        court_id: reserva.canchasdep_id,
        start_date: reserva.fecha_empieza,
        end_date: reserva.fecha_termina,
        reason: isManualBlock 
          ? 'Bloqueo Manual' 
          : reserva.estado === 'pagada' 
            ? 'Reservado' 
            : 'Reserva Pendiente',
        state: isManualBlock ? 'bloqueada' : 'reservado',
        code: reserva.code || null,
        user_email: (reserva.usuarios as any)?.email || ''
      }
    })
  },

  /**
   * Bloquear un horario en una cancha
   */
  async blockSchedule(
    courtId: number,
    startDate: string,
    endDate: string,
    reason?: string,
    allDay?: boolean
  ): Promise<any> {
    // Para bloqueos específicos, validar que no se crucen con reservas o bloqueos existentes
    if (!allDay) {
      const isAvailable = await this.isTimeSlotAvailable(courtId, startDate, endDate)
      if (!isAvailable) {
        throw new Error('El horario seleccionado ya se encuentra ocupado o reservado.')
      }
    }

    // Obtener un usuario de la base de datos para no violar la FK (usuarios_id es NOT NULL)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('usuarios')
      .select('id')
      .limit(1)
      .single()

    if (userError || !userData) {
      throw new Error('No se encontró ningún usuario para asociar al bloqueo.')
    }

    if (allDay) {
      const date = startDate.split('T')[0]
      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('reservas')
        .select('fecha_empieza, fecha_termina')
        .eq('canchasdep_id', courtId)
        .in('estado', ['pendiente', 'pagada', 'bloqueada'])
        .gte('fecha_empieza', `${date}T00:00:00Z`)
        .lte('fecha_termina', `${date}T23:59:59Z`)

      if (fetchError) throw new Error(`Error al obtener reservas del día: ${fetchError.message}`)

      // Definimos el rango operativo de la cancha: 6 AM a 11 PM
      const opStart = 6
      const opEnd = 23
      
      const freeRanges: { start: string; end: string }[] = []
      let currentStart: number | null = null

      for (let h = opStart; h < opEnd; h++) {
        const hStartStr = `${date}T${h.toString().padStart(2, '0')}:00:00Z`
        const hEndStr = `${date}T${(h + 1).toString().padStart(2, '0')}:00:00Z`
        
        const slotStart = new Date(hStartStr)
        const slotEnd = new Date(hEndStr)

        const isReserved = (existing || []).some(res => {
          const resStart = new Date(res.fecha_empieza)
          const resEnd = new Date(res.fecha_termina)
          return resStart < slotEnd && resEnd > slotStart
        })

        if (!isReserved) {
          if (currentStart === null) {
            currentStart = h
          }
        } else {
          if (currentStart !== null) {
            freeRanges.push({
              start: `${date}T${currentStart.toString().padStart(2, '0')}:00:00Z`,
              end: `${date}T${h.toString().padStart(2, '0')}:00:00Z`
            })
            currentStart = null
          }
        }
      }

      if (currentStart !== null) {
        freeRanges.push({
          start: `${date}T${currentStart.toString().padStart(2, '0')}:00:00Z`,
          end: `${date}T${opEnd.toString().padStart(2, '0')}:00:00Z`
        })
      }

      if (freeRanges.length === 0) {
        throw new Error('No hay horarios libres en este día para bloquear.')
      }

      const inserts = freeRanges.map(range => {
        const blockCode = 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase()
        return {
          canchasdep_id: courtId,
          usuarios_id: userData.id,
          fecha_empieza: range.start,
          fecha_termina: range.end,
          estado: 'bloqueada',
          precio_total: 0,
          code: blockCode,
        }
      })

      const { data, error } = await supabaseAdmin
        .from('reservas')
        .insert(inserts)
        .select()

      if (error) throw new Error(`Error al crear bloqueos parciales: ${error.message}`)
      return data
    }

    // Generar un código único de 8 caracteres
    const blockCode = 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase()

    // Sanitizar cadenas de fecha y hora
    const cleanStart = sanitizeDatetime(startDate)
    const cleanEnd = sanitizeDatetime(endDate)

    // Crea una "reserva" especial que marca el bloqueo
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .insert([
        {
          canchasdep_id: courtId,
          usuarios_id: userData.id,
          fecha_empieza: cleanStart,
          fecha_termina: cleanEnd,
          estado: 'bloqueada', // 'bloqueada' ya que ahora está soportado en la BD
          precio_total: 0,
          code: blockCode,
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
    // Primero eliminar el historial relacionado para no violar la FK
    await supabaseAdmin.from('historial_reservas').delete().eq('reservas_id', scheduleId)

    // Luego eliminar la reserva
    const { error } = await supabaseAdmin.from('reservas').delete().eq('id', scheduleId)

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
    const cleanStart = sanitizeDatetime(startDate)
    const cleanEnd = sanitizeDatetime(endDate)

    const { count, error } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('canchasdep_id', courtId)
      .in('estado', ['pendiente', 'pagada', 'bloqueada'])
      .lt('fecha_empieza', cleanEnd)
      .gt('fecha_termina', cleanStart)

    if (error) throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    return (count || 0) === 0
  },
}
