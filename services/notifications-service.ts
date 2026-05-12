import { supabase } from '@/lib/supabase'
import { Notificacion } from '@/types/database'

/**
 * Notifications Service - CRUD operations para Notificaciones
 */

export const notificationsService = {
  /**
   * Obtener notificaciones de un usuario
   */
  async getNotifications(userId: number, limit = 50): Promise<Notificacion[]> {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuarios_id', userId)
      .order('creado_en', { ascending: false })
      .limit(limit)

    if (error) throw new Error(`Error al obtener notificaciones: ${error.message}`)
    return data || []
  },

  /**
   * Obtener notificaciones no leídas
   */
  async getUnreadNotifications(userId: number): Promise<Notificacion[]> {
    const { data, error } = await supabase
      .from('notificaciones')
      .select('*')
      .eq('usuarios_id', userId)
      .eq('leido', false)
      .order('creado_en', { ascending: false })

    if (error) throw new Error(`Error al obtener notificaciones no leídas: ${error.message}`)
    return data || []
  },

  /**
   * Obtener cantidad de notificaciones no leídas
   */
  async getUnreadCount(userId: number): Promise<number> {
    const { count, error } = await supabase
      .from('notificaciones')
      .select('*', { count: 'exact', head: true })
      .eq('usuarios_id', userId)
      .eq('leido', false)

    if (error) throw new Error(`Error al contar notificaciones: ${error.message}`)
    return count || 0
  },

  /**
   * Crear una notificación
   */
  async createNotification(notification: Omit<Notificacion, 'id' | 'creado_en'>): Promise<Notificacion> {
    const { data, error } = await supabase
      .from('notificaciones')
      .insert([
        {
          ...notification,
          creado_en: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al crear notificación: ${error.message}`)
    return data
  },

  /**
   * Marcar notificación como leída
   */
  async markAsRead(notificationId: number): Promise<Notificacion> {
    const { data, error } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('id', notificationId)
      .select()
      .single()

    if (error) throw new Error(`Error al marcar notificación como leída: ${error.message}`)
    return data
  },

  /**
   * Marcar todas las notificaciones como leídas
   */
  async markAllAsRead(userId: number): Promise<void> {
    const { error } = await supabase
      .from('notificaciones')
      .update({ leido: true })
      .eq('usuarios_id', userId)
      .eq('leido', false)

    if (error) throw new Error(`Error al marcar todas como leídas: ${error.message}`)
  },

  /**
   * Eliminar una notificación
   */
  async deleteNotification(notificationId: number): Promise<void> {
    const { error } = await supabase.from('notificaciones').delete().eq('id', notificationId)

    if (error) throw new Error(`Error al eliminar notificación: ${error.message}`)
  },

  /**
   * Crear notificación de reserva
   */
  async notifyReservationCreated(userId: number, courtName: string, date: string): Promise<Notificacion> {
    return this.createNotification({
      usuarios_id: userId,
      tipo: 'reserva_creada',
      titulo: 'Nueva Reserva',
      mensaje: `Tu reserva en ${courtName} para ${date} ha sido confirmada`,
      leido: false,
    })
  },

  /**
   * Crear notificación de pago
   */
  async notifyPaymentSuccess(userId: number, amount: number): Promise<Notificacion> {
    return this.createNotification({
      usuarios_id: userId,
      tipo: 'pago_exitoso',
      titulo: 'Pago Confirmado',
      mensaje: `Tu pago de S/ ${amount.toFixed(2)} ha sido procesado exitosamente`,
      leido: false,
    })
  },

  /**
   * Crear notificación de disponibilidad
   */
  async notifyAvailability(userId: number, courtName: string): Promise<Notificacion> {
    return this.createNotification({
      usuarios_id: userId,
      tipo: 'disponibilidad',
      titulo: 'Cancha Disponible',
      mensaje: `${courtName} está disponible en tu horario preferido`,
      leido: false,
    })
  },
}
