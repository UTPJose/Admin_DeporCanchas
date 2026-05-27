import { supabaseAdmin as supabase } from '@/lib/supabase'
import { DashboardStats } from '@/types/database'
import { limaYMD } from '@/lib/lima-time'

/**
 * Reports Service - Análisis y estadísticas
 */

export interface RevenueReport {
  totalRevenue: number
  totalReservations: number
  averageReservation: number
  variationPercentage: number
  byDeport: { deport: string; amount: number }[]
  byCourt: { cancha: string; amount: number }[]
  dailyData: { date: string; revenue: number }[]
}

export const reportsService = {
  /**
   * Reporte de ingresos completo para la página de Reportes.
   * Reservas `pagada` por `fecha_empieza` dentro del rango. Compara con el
   * período inmediatamente anterior de igual duración para la variación %.
   */
  async getRevenueReport(from: string, to: string): Promise<RevenueReport> {
    const { data, error } = await supabase
      .from('reservas')
      .select('fecha_empieza, precio_total, canchasdep:canchasdep_id(nombre, tipo_deporte)')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', from)
      .lte('fecha_empieza', to)
    if (error) throw new Error(`Error al obtener ingresos: ${error.message}`)

    const rows = (data || []) as any[]
    const totalRevenue = rows.reduce((s, r) => s + (r.precio_total || 0), 0)
    const totalReservations = rows.length
    const averageReservation = totalReservations ? totalRevenue / totalReservations : 0

    // Etiquetas de deporte (valor → etiqueta con tildes)
    const { data: tipos } = await supabase.from('tipos_cancha').select('valor, etiqueta')
    const label = (valor: string) =>
      (tipos || []).find((t: any) => t.valor === valor)?.etiqueta || valor || 'Desconocido'

    const byDeportMap: Record<string, number> = {}
    const byCourtMap: Record<string, number> = {}
    const dailyMap: Record<string, number> = {}
    for (const r of rows) {
      const dep = label(r.canchasdep?.tipo_deporte)
      byDeportMap[dep] = (byDeportMap[dep] || 0) + (r.precio_total || 0)
      const cancha = r.canchasdep?.nombre || 'Desconocida'
      byCourtMap[cancha] = (byCourtMap[cancha] || 0) + (r.precio_total || 0)
      const dia = limaYMD(r.fecha_empieza)
      dailyMap[dia] = (dailyMap[dia] || 0) + (r.precio_total || 0)
    }

    // Período anterior de igual duración
    const fromMs = new Date(from).getTime()
    const toMs = new Date(to).getTime()
    const dur = Math.max(0, toMs - fromMs)
    const prevFrom = new Date(fromMs - dur).toISOString()
    const prevTo = new Date(fromMs).toISOString()
    const { data: prev } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', prevFrom)
      .lt('fecha_empieza', prevTo)
    const prevRevenue = (prev || []).reduce((s, r) => s + (r.precio_total || 0), 0)
    const variationPercentage = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0

    return {
      totalRevenue,
      totalReservations,
      averageReservation,
      variationPercentage,
      byDeport: Object.entries(byDeportMap).map(([deport, amount]) => ({ deport, amount })),
      byCourt: Object.entries(byCourtMap)
        .map(([cancha, amount]) => ({ cancha, amount }))
        .sort((a, b) => b.amount - a.amount),
      dailyData: Object.entries(dailyMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    }
  },

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // Total usuarios
    const { count: totalUsuarios } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })

    // Total reservas
    const { count: totalReservas } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })

    // Total ingresos (reservas finalizadas)
    const { data: reservasFinalizadas } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('estado', 'pagada')

    const totalIngresos = (reservasFinalizadas || []).reduce((sum, r) => sum + r.precio_total, 0)

    // Total pendientes (reservas pendientes + pagos pendientes)
    const { count: reservasPendientes } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')

    // Reservas por día (últimos 7 días)
    const today = new Date()
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const { data: reservasPorDia } = await supabase
      .from('reservas')
      .select('fecha_empieza')
      .gte('fecha_empieza', sevenDaysAgo.toISOString())
      .lte('fecha_empieza', today.toISOString())

    // Agrupar por día
    const grouped: { [key: string]: number } = {}
    ;(reservasPorDia || []).forEach((r) => {
      const dia = new Date(r.fecha_empieza).toLocaleDateString('es-PE')
      grouped[dia] = (grouped[dia] || 0) + 1
    })

    const reservasAgrupadas = Object.entries(grouped).map(([dia, cantidad]) => ({
      dia,
      cantidad,
    }))

    return {
      total_usuarios: totalUsuarios || 0,
      total_reservas: totalReservas || 0,
      total_ingresos: totalIngresos,
      total_pendientes: (reservasPendientes || 0),
      reservas_por_dia: reservasAgrupadas,
    }
  },

  /**
   * Obtener ingresos por período
   */
  async getRevenueByPeriod(
    startDate: string,
    endDate: string
  ): Promise<{ periodo: string; monto: number }[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('fecha_empieza, precio_total')
      .gte('fecha_empieza', startDate)
      .lte('fecha_empieza', endDate)
      .eq('estado', 'pagada')

    if (error) throw new Error(`Error al obtener ingresos: ${error.message}`)

    // Agrupar por fecha
    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((r) => {
      const fecha = new Date(r.fecha_empieza).toLocaleDateString('es-PE')
      grouped[fecha] = (grouped[fecha] || 0) + r.precio_total
    })

    return Object.entries(grouped).map(([periodo, monto]) => ({
      periodo,
      monto,
    }))
  },

  /**
   * Obtener reservas por deporte
   */
  async getReservationsByDeport(): Promise<{ deporte: string; cantidad: number }[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('canchasdep:canchasdep_id(tipo_deporte)')
      .in('estado', ['pagada', 'pendiente'])

    if (error) throw new Error(`Error al obtener reservas por deporte: ${error.message}`)

    const { data: tipos } = await supabase.from('tipos_cancha').select('valor, etiqueta')
    const label = (valor: string) =>
      (tipos || []).find((t: any) => t.valor === valor)?.etiqueta || valor || 'Desconocido'

    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((r: any) => {
      const deporte = label(r.canchasdep?.tipo_deporte)
      grouped[deporte] = (grouped[deporte] || 0) + 1
    })

    return Object.entries(grouped).map(([deporte, cantidad]) => ({
      deporte,
      cantidad,
    }))
  },

  /**
   * Obtener ingresos por cancha
   */
  async getRevenueByProperty(): Promise<{ cancha: string; ingresos: number }[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('canchasdep:canchasdep_id(nombre), precio_total')
      .eq('estado', 'pagada')

    if (error) throw new Error(`Error al obtener ingresos por cancha: ${error.message}`)

    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((r: any) => {
      const cancha = r.canchasdep?.nombre || 'Desconocida'
      grouped[cancha] = (grouped[cancha] || 0) + r.precio_total
    })

    return Object.entries(grouped).map(([cancha, ingresos]) => ({
      cancha,
      ingresos,
    }))
  },

  /**
   * Obtener tasa de ocupación por cancha
   */
  async getOccupancyRate(): Promise<{ cancha: string; ocupacion: number }[]> {
    // Este cálculo es más complejo y requeriría datos de disponibilidad
    // Por ahora retorna array vacío
    return []
  },

  /**
   * Obtener usuarios más activos
   */
  async getTopUsers(limit = 10): Promise<{ usuario: string; reservas: number }[]> {
    const { data, error } = await supabase
      .from('reservas')
      .select('usuarios_id, usuarios!inner(nombre)')
      .limit(limit)

    if (error) throw new Error(`Error al obtener usuarios activos: ${error.message}`)

    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((r: any) => {
      const usuario = r.usuarios?.nombre || 'Desconocido'
      grouped[usuario] = (grouped[usuario] || 0) + 1
    })

    return Object.entries(grouped)
      .map(([usuario, reservas]) => ({
        usuario,
        reservas,
      }))
      .sort((a, b) => b.reservas - a.reservas)
      .slice(0, limit)
  },

  /**
   * Comparar períodos
   */
  async comparePeriods(
    startDate1: string,
    endDate1: string,
    startDate2: string,
    endDate2: string
  ): Promise<{
    periodo1: number
    periodo2: number
    cambio_porcentual: number
  }> {
    const revenue1 = await getRevenueBetweenDates(startDate1, endDate1)
    const revenue2 = await getRevenueBetweenDates(startDate2, endDate2)

    const cambio_porcentual = revenue1 > 0 ? ((revenue2 - revenue1) / revenue1) * 100 : 0

    return {
      periodo1: revenue1,
      periodo2: revenue2,
      cambio_porcentual,
    }
  },
}

/**
 * Helper: obtener ingresos entre fechas
 */
async function getRevenueBetweenDates(startDate: string, endDate: string): Promise<number> {
  const { data } = await supabase
    .from('reservas')
    .select('precio_total')
    .gte('fecha_empieza', startDate)
    .lte('fecha_empieza', endDate)
    .eq('estado', 'pagada')

  return (data || []).reduce((sum, r) => sum + r.precio_total, 0)
}
