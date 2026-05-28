import { supabaseAdmin } from '@/lib/supabase'
import { CanchaDisponibilidad } from '@/types/database'
import { sanitizeDatetime } from '@/utils/helpers'
import { limaToUtcISO, limaYMD, addDaysYMD } from '@/lib/lima-time'

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
   * Reemplaza la disponibilidad completa de la cancha por una franja única
   * aplicada a los 7 días (0=Dom..6=Sáb). Útil para el modal de cancha.
   */
  async replaceAvailability(courtId: number, horaAbre: string, horaCierra: string): Promise<void> {
    const cleanAbre = horaAbre.length === 5 ? `${horaAbre}:00` : horaAbre
    const cleanCierra = horaCierra.length === 5 ? `${horaCierra}:00` : horaCierra
    const { error: delErr } = await supabaseAdmin
      .from('cancha_disponibilidad')
      .delete()
      .eq('canchasdep_id', courtId)
    if (delErr) throw new Error(`Error al limpiar disponibilidad: ${delErr.message}`)
    const rows = [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      canchasdep_id: courtId,
      dias_de_la_semana: d,
      hora_abre: cleanAbre,
      hora_cierra: cleanCierra,
    }))
    const { error: insErr } = await supabaseAdmin.from('cancha_disponibilidad').insert(rows)
    if (insErr) throw new Error(`Error al crear disponibilidad: ${insErr.message}`)
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
    // Los horarios bloqueados se almacenan como reservas con estado especial.
    // weekStart/weekEnd son YMD en hora Lima; los convertimos a instantes UTC.
    // Ventana [00:00 del lunes Lima, 00:00 del día siguiente al domingo Lima).
    const startUtc = limaToUtcISO(weekStart, '00:00:00')
    const endUtc = limaToUtcISO(addDaysYMD(weekEnd, 1), '00:00:00')
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('id, canchasdep_id, fecha_empieza, fecha_termina, estado, code, motivo, usuarios(email)')
      .eq('canchasdep_id', courtId)
      .in('estado', ['pendiente', 'pagada', 'bloqueada'])
      .gte('fecha_empieza', startUtc)
      .lt('fecha_empieza', endUtc)

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
          ? (reserva as any).motivo || 'Bloqueo Manual'
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
    adminId: number,
    reason?: string,
    allDay?: boolean
  ): Promise<any> {
    // Para bloqueos específicos, validar que no se crucen con reservas o bloqueos existentes.
    // El mensaje distingue el caso "reserva en proceso de pago" para no confundir al admin.
    if (!allDay) {
      const conflict = await this.findConflict(courtId, startDate, endDate)
      if (conflict === 'pendiente') {
        throw new Error(
          'Ese horario tiene una reserva en proceso de pago. Se libera en ≤10 min si no se concreta; vuelve a intentar más tarde.'
        )
      }
      if (conflict === 'pagada') {
        throw new Error('Ese horario ya tiene una reserva pagada y no se puede bloquear.')
      }
      if (conflict === 'bloqueada') {
        throw new Error('Ese horario ya está bloqueado.')
      }
    }

    // El bloqueo queda registrado a nombre del admin logueado que lo crea
    // (FK usuarios_id NOT NULL). Acción del rol admin; el cliente solo lo ve como
    // slot 'bloqueada'. Cualquier admin puede crear o liberar bloqueos.

    if (allDay) {
      // Día (YMD) en hora Lima a partir del instante de inicio recibido
      const date = limaYMD(startDate)
      // Ventana del día completo (Lima) en instantes UTC
      const dayStartUtc = limaToUtcISO(date, '00:00:00')
      const dayEndUtc = limaToUtcISO(date, '23:59:59')

      const { data: existing, error: fetchError } = await supabaseAdmin
        .from('reservas')
        .select('fecha_empieza, fecha_termina')
        .eq('canchasdep_id', courtId)
        .in('estado', ['pendiente', 'pagada', 'bloqueada'])
        .gte('fecha_empieza', dayStartUtc)
        .lte('fecha_termina', dayEndUtc)

      if (fetchError) throw new Error(`Error al obtener reservas del día: ${fetchError.message}`)

      // Rango operativo de la cancha: 6 AM a 11 PM (hora Lima)
      const opStart = 6
      const opEnd = 23

      const hourIso = (h: number) => limaToUtcISO(date, `${h.toString().padStart(2, '0')}:00:00`)

      const freeRanges: { start: string; end: string }[] = []
      let currentStart: number | null = null

      for (let h = opStart; h < opEnd; h++) {
        const slotStart = new Date(hourIso(h))
        const slotEnd = new Date(hourIso(h + 1))

        const isReserved = (existing || []).some(res => {
          const resStart = new Date(res.fecha_empieza)
          const resEnd = new Date(res.fecha_termina)
          return resStart < slotEnd && resEnd > slotStart
        })

        if (!isReserved) {
          if (currentStart === null) currentStart = h
        } else if (currentStart !== null) {
          freeRanges.push({ start: hourIso(currentStart), end: hourIso(h) })
          currentStart = null
        }
      }

      if (currentStart !== null) {
        freeRanges.push({ start: hourIso(currentStart), end: hourIso(opEnd) })
      }

      if (freeRanges.length === 0) {
        throw new Error('No hay horarios libres en este día para bloquear.')
      }

      const inserts = freeRanges.map(range => {
        const blockCode = 'BK' + Math.random().toString(36).substring(2, 8).toUpperCase()
        return {
          canchasdep_id: courtId,
          usuarios_id: adminId,
          fecha_empieza: range.start,
          fecha_termina: range.end,
          estado: 'bloqueada',
          precio_total: 0,
          code: blockCode,
          motivo: reason ?? null,
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
          usuarios_id: adminId,
          fecha_empieza: cleanStart,
          fecha_termina: cleanEnd,
          estado: 'bloqueada', // 'bloqueada' ya que ahora está soportado en la BD
          precio_total: 0,
          code: blockCode,
          motivo: reason ?? null,
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al bloquear horario: ${error.message}`)
    return data
  },

  /**
   * Editar un bloqueo manual existente (fecha/hora/motivo).
   * Solo aplica a reservas con estado 'bloqueada'. Valida solapes contra otras
   * reservas/bloqueos (excluyéndose a sí mismo); el constraint EXCLUDE de la BD
   * es la última línea de defensa.
   */
  async updateBlock(
    scheduleId: number,
    startDate: string,
    endDate: string,
    motivo?: string
  ): Promise<any> {
    const cleanStart = sanitizeDatetime(startDate)
    const cleanEnd = sanitizeDatetime(endDate)

    // Verificar que sea un bloqueo y obtener su cancha
    const { data: actual, error: getErr } = await supabaseAdmin
      .from('reservas')
      .select('id, canchasdep_id, estado')
      .eq('id', scheduleId)
      .single()
    if (getErr || !actual) throw new Error('Bloqueo no encontrado.')
    if (actual.estado !== 'bloqueada') throw new Error('Solo se pueden editar bloqueos manuales.')

    // Solape con otras filas (excluyéndose a sí mismo)
    const { count, error: countErr } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('canchasdep_id', actual.canchasdep_id)
      .neq('id', scheduleId)
      .in('estado', ['pendiente', 'pagada', 'bloqueada'])
      .lt('fecha_empieza', cleanEnd)
      .gt('fecha_termina', cleanStart)
    if (countErr) throw new Error(`Error al validar disponibilidad: ${countErr.message}`)
    if ((count || 0) > 0) {
      throw new Error('El nuevo horario se cruza con otra reserva o bloqueo.')
    }

    const { data, error } = await supabaseAdmin
      .from('reservas')
      .update({
        fecha_empieza: cleanStart,
        fecha_termina: cleanEnd,
        motivo: motivo ?? null,
      })
      .eq('id', scheduleId)
      .select()
      .single()
    if (error) throw new Error(`Error al editar bloqueo: ${error.message}`)
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
   * Devuelve el estado del primer solape ('pendiente' | 'pagada' | 'bloqueada')
   * o null si el horario está libre. Prioriza 'pagada' > 'pendiente' > 'bloqueada'
   * para dar el mensaje más relevante.
   */
  async findConflict(
    courtId: number,
    startDate: string,
    endDate: string
  ): Promise<'pendiente' | 'pagada' | 'bloqueada' | null> {
    const cleanStart = sanitizeDatetime(startDate)
    const cleanEnd = sanitizeDatetime(endDate)

    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('estado')
      .eq('canchasdep_id', courtId)
      .in('estado', ['pendiente', 'pagada', 'bloqueada'])
      .lt('fecha_empieza', cleanEnd)
      .gt('fecha_termina', cleanStart)

    if (error) throw new Error(`Error al verificar disponibilidad: ${error.message}`)
    const estados = new Set((data || []).map((r) => r.estado))
    if (estados.has('pagada')) return 'pagada'
    if (estados.has('pendiente')) return 'pendiente'
    if (estados.has('bloqueada')) return 'bloqueada'
    return null
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
