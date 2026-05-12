import { supabase } from '@/lib/supabase'
import { Pago } from '@/types/database'

/**
 * Payments Service - CRUD operations para Pagos
 */

export const paymentsService = {
  /**
   * Obtener todos los pagos
   */
  async getPayments(): Promise<Pago[]> {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('creado_en', { ascending: false })

    if (error) throw new Error(`Error al obtener pagos: ${error.message}`)
    return data || []
  },

  /**
   * Obtener un pago por ID
   */
  async getPaymentById(id: number): Promise<Pago | null> {
    const { data, error } = await supabase.from('pagos').select('*').eq('id', id).single()

    if (error && error.code !== 'PGRST116') throw new Error(`Error al obtener pago: ${error.message}`)
    return data || null
  },

  /**
   * Obtener pagos de una reserva
   */
  async getReservationPayments(reservaId: number): Promise<Pago[]> {
    const { data, error } = await supabase.from('pagos').select('*').eq('reserva_id', reservaId)

    if (error) throw new Error(`Error al obtener pagos de reserva: ${error.message}`)
    return data || []
  },

  /**
   * Crear un pago
   */
  async createPayment(payment: Omit<Pago, 'id' | 'creado_en'>): Promise<Pago> {
    const { data, error } = await supabase
      .from('pagos')
      .insert([
        {
          ...payment,
          creado_en: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (error) throw new Error(`Error al crear pago: ${error.message}`)
    return data
  },

  /**
   * Actualizar estado de un pago
   */
  async updatePaymentStatus(id: number, status: Pago['estado']): Promise<Pago> {
    const { data, error } = await supabase.from('pagos').update({ estado: status }).eq('id', id).select().single()

    if (error) throw new Error(`Error al actualizar pago: ${error.message}`)
    return data
  },

  /**
   * Marcar pago como completado
   */
  async markAsCompleted(id: number): Promise<Pago> {
    return this.updatePaymentStatus(id, 'completado')
  },

  /**
   * Marcar pago como fallido
   */
  async markAsFailed(id: number): Promise<Pago> {
    return this.updatePaymentStatus(id, 'fallido')
  },

  /**
   * Reembolsar un pago
   */
  async refundPayment(id: number): Promise<Pago> {
    return this.updatePaymentStatus(id, 'reembolsado')
  },

  /**
   * Obtener pagos pendientes
   */
  async getPendingPayments(): Promise<Pago[]> {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .eq('estado', 'pendiente')
      .order('creado_en', { ascending: true })

    if (error) throw new Error(`Error al obtener pagos pendientes: ${error.message}`)
    return data || []
  },

  /**
   * Obtener total de ingresos por método de pago
   */
  async getRevenueByPaymentMethod(): Promise<{ metodo: string; total: number }[]> {
    const { data, error } = await supabase
      .from('pagos')
      .select('metodo_pago, monto')
      .eq('estado', 'completado')

    if (error) throw new Error(`Error al obtener ingresos por método: ${error.message}`)

    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((p) => {
      grouped[p.metodo_pago] = (grouped[p.metodo_pago] || 0) + p.monto
    })

    return Object.entries(grouped).map(([metodo, total]) => ({
      metodo,
      total,
    }))
  },

  /**
   * Obtener ingresos totales completados
   */
  async getTotalRevenue(): Promise<number> {
    const { data, error } = await supabase
      .from('pagos')
      .select('monto')
      .eq('estado', 'completado')

    if (error) throw new Error(`Error al obtener ingresos totales: ${error.message}`)

    return (data || []).reduce((sum, p) => sum + p.monto, 0)
  },

  /**
   * Obtener ingresos del mes actual
   */
  async getCurrentMonthRevenue(): Promise<number> {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    const { data, error } = await supabase
      .from('pagos')
      .select('monto')
      .eq('estado', 'completado')
      .gte('creado_en', monthStart)
      .lte('creado_en', monthEnd)

    if (error) throw new Error(`Error al obtener ingresos del mes: ${error.message}`)

    return (data || []).reduce((sum, p) => sum + p.monto, 0)
  },
}
