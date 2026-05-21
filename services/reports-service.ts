import { supabaseAdmin } from '@/lib/supabase'
import { DashboardStats } from '@/types/database'

/**
 * Reports Service - Análisis y estadísticas
 */

export const reportsService = {
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(days = 7): Promise<DashboardStats> {
    // Total usuarios
    const { count: totalUsuarios } = await supabaseAdmin
      .from('usuarios')
      .select('*', { count: 'exact', head: true })

    // Total reservas
    const { count: totalReservas } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })

    // Total ingresos (reservas finalizadas)
    const { data: reservasFinalizadas } = await supabaseAdmin
      .from('reservas')
      .select('precio_total')
      .eq('estado', 'pagada')

    const totalIngresos = (reservasFinalizadas || []).reduce((sum, r) => sum + r.precio_total, 0)

    // Total pendientes (reservas pendientes + pagos pendientes)
    const { count: reservasPendientes } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')

    // Reservas por día (últimos N días)
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - days + 1)
    startDate.setHours(0, 0, 0, 0)

    const { data: reservasPorDia } = await supabaseAdmin
      .from('reservas')
      .select('fecha_empieza')
      .gte('fecha_empieza', startDate.toISOString())
      .lte('fecha_empieza', today.toISOString())
      .in('estado', ['pagada', 'pendiente'])

    const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
    const formatDayLabel = (date: Date) => {
      return `${date.getDate()} ${MONTHS_ES[date.getMonth()]}`
    }

    // Generar secuencia cronológica de los últimos N días con valor inicial 0
    const grouped: { [key: string]: number } = {}
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate.getTime())
      d.setDate(startDate.getDate() + i)
      const label = formatDayLabel(d)
      grouped[label] = 0
    }

    // Contar las reservas por día
    ;(reservasPorDia || []).forEach((r) => {
      const label = formatDayLabel(new Date(r.fecha_empieza))
      if (grouped[label] !== undefined) {
        grouped[label] += 1
      }
    })

    const reservasAgrupadas = Object.entries(grouped).map(([dia, cantidad]) => ({
      dia,
      cantidad,
    }))

    // Calcular tendencias mensuales (últimos 30 días vs los 30 días previos)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)

    // Nuevos usuarios en los últimos 30 días
    const { count: usuariosNuevos } = await supabaseAdmin
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .gte('creado_en', thirtyDaysAgo.toISOString())

    const totalUsuariosPrevio = (totalUsuarios || 0) - (usuariosNuevos || 0)
    const usuariosTrend = totalUsuariosPrevio > 0 
      ? ((usuariosNuevos || 0) / totalUsuariosPrevio) * 100 
      : ((usuariosNuevos || 0) > 0 ? 100 : 0)

    // Reservas últimos 30 días vs anteriores 30 días
    const { count: reservasUltimos30 } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_empieza', thirtyDaysAgo.toISOString())
      .in('estado', ['pagada', 'pendiente'])

    const { count: reservasPrevias30 } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .gte('fecha_empieza', sixtyDaysAgo.toISOString())
      .lt('fecha_empieza', thirtyDaysAgo.toISOString())
      .in('estado', ['pagada', 'pendiente'])

    const reservasTrend = (reservasPrevias30 || 0) > 0 
      ? (((reservasUltimos30 || 0) - (reservasPrevias30 || 0)) / (reservasPrevias30 || 0)) * 100 
      : ((reservasUltimos30 || 0) > 0 ? 100 : 0)

    // Ingresos últimos 30 días vs anteriores 30 días
    const { data: ingresosUltimos30 } = await supabaseAdmin
      .from('reservas')
      .select('precio_total')
      .gte('fecha_empieza', thirtyDaysAgo.toISOString())
      .eq('estado', 'pagada')

    const { data: ingresosPrevios30 } = await supabaseAdmin
      .from('reservas')
      .select('precio_total')
      .gte('fecha_empieza', sixtyDaysAgo.toISOString())
      .lt('fecha_empieza', thirtyDaysAgo.toISOString())
      .eq('estado', 'pagada')

    const totalIngresosUltimos30 = (ingresosUltimos30 || []).reduce((sum, r) => sum + r.precio_total, 0)
    const totalIngresosPrevios30 = (ingresosPrevios30 || []).reduce((sum, r) => sum + r.precio_total, 0)

    const ingresosTrend = totalIngresosPrevios30 > 0
      ? ((totalIngresosUltimos30 - totalIngresosPrevios30) / totalIngresosPrevios30) * 100
      : (totalIngresosUltimos30 > 0 ? 100 : 0)

    return {
      total_usuarios: totalUsuarios || 0,
      total_reservas: totalReservas || 0,
      total_ingresos: totalIngresos,
      total_pendientes: (reservasPendientes || 0),
      usuarios_trend: Math.round(usuariosTrend * 10) / 10,
      reservas_trend: Math.round(reservasTrend * 10) / 10,
      ingresos_trend: Math.round(ingresosTrend * 10) / 10,
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
      .from('reservas')
      .select('canchasdep:canchasdep_id(tipo_deporte)')
      .in('estado', ['pagada', 'pendiente'])

    if (error) throw new Error(`Error al obtener reservas por deporte: ${error.message}`)

    const grouped: { [key: string]: number } = {}
    ;(data || []).forEach((r: any) => {
      const deporte = r.canchasdep?.tipo_deporte || 'Desconocido'
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
    const { data, error } = await supabaseAdmin
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
    const { data, error } = await supabaseAdmin
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
   * Obtener datos consolidados del reporte de ingresos para la UI
   */
  async getRevenueReportData(
    startDate: string,
    endDate: string,
    period = 'week'
  ): Promise<{
    totalRevenue: number
    averageReservation: number
    totalReservations: number
    variationPercentage: number
    byDeport: { deport: string; amount: number }[]
    dailyData: { date: string; revenue: number }[]
  }> {
    // 1. Obtener reservas pagadas en el período actual
    const { data: currentReservations, error: errCurrent } = await supabaseAdmin
      .from('reservas')
      .select('fecha_empieza, precio_total, canchasdep:canchasdep_id(tipo_deporte)')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', `${startDate}T00:00:00Z`)
      .lte('fecha_empieza', `${endDate}T23:59:59Z`)

    if (errCurrent) throw new Error(`Error al obtener ingresos: ${errCurrent.message}`)

    const totalRevenue = (currentReservations || []).reduce((sum, r) => sum + r.precio_total, 0)

    // 2. Obtener reservas totales (pagadas y pendientes) en el período actual
    const { count: totalReservasCount } = await supabaseAdmin
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .in('estado', ['pagada', 'pendiente'])
      .gte('fecha_empieza', `${startDate}T00:00:00Z`)
      .lte('fecha_empieza', `${endDate}T23:59:59Z`)

    const totalResCount = totalReservasCount || 0
    const averageReservation = totalResCount > 0 ? totalRevenue / totalResCount : 0

    // 3. Obtener ingresos por día formateados y agrupados según período (week, month, year)
    let dailyData: { date: string; revenue: number }[] = []

    if (period === 'year') {
      // Group by Month for the last 12 months ending in the current month (inclusive)
      const monthlyMap: { [key: string]: number } = {}
      const endObj = new Date(endDate)

      for (let i = 11; i >= 0; i--) {
        const d = new Date(endObj.getFullYear(), endObj.getMonth() - i, 1)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        monthlyMap[`${year}-${month}`] = 0
      }

      ;(currentReservations || []).forEach((r) => {
        const dateObj = new Date(r.fecha_empieza)
        const year = dateObj.getFullYear()
        const month = String(dateObj.getMonth() + 1).padStart(2, '0')
        const key = `${year}-${month}`
        if (monthlyMap[key] !== undefined) {
          monthlyMap[key] += r.precio_total
        }
      })

      dailyData = Object.entries(monthlyMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))

    } else if (period === 'month') {
      // Group by 3-day intervals ending exactly on endDate (getting 10 points)
      const intervalMap: { [key: string]: number } = {}
      const endObj = new Date(endDate)

      for (let i = 9; i >= 0; i--) {
        const d = new Date(endObj.getTime())
        d.setDate(endObj.getDate() - (i * 3))
        const dateStr = d.toISOString().split('T')[0]
        intervalMap[dateStr] = 0
      }

      const bucketKeys = Object.keys(intervalMap).sort()

      ;(currentReservations || []).forEach((r) => {
        const dateStr = new Date(r.fecha_empieza).toISOString().split('T')[0]
        // Find the first bucket key that is >= dateStr
        let targetKey = bucketKeys[bucketKeys.length - 1]
        for (const key of bucketKeys) {
          if (key >= dateStr) {
            targetKey = key
            break
          }
        }

        if (intervalMap[targetKey] !== undefined) {
          intervalMap[targetKey] += r.precio_total
        }
      })

      dailyData = Object.entries(intervalMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))

    } else {
      // Default: daily data (e.g. week: 7 days)
      const dailyMap: { [key: string]: number } = {}
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffDays = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      for (let i = 0; i <= diffDays; i++) {
        const d = new Date(start.getTime())
        d.setDate(start.getDate() + i)
        const dateStr = d.toISOString().split('T')[0]
        dailyMap[dateStr] = 0
      }

      ;(currentReservations || []).forEach((r) => {
        const dateStr = new Date(r.fecha_empieza).toISOString().split('T')[0]
        if (dailyMap[dateStr] !== undefined) {
          dailyMap[dateStr] += r.precio_total
        }
      })

      dailyData = Object.entries(dailyMap)
        .map(([date, revenue]) => ({ date, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }

    // 4. Obtener distribución de ingresos por deporte
    const deportMap: { [key: string]: number } = {}
    ;(currentReservations || []).forEach((r: any) => {
      const dep = r.canchasdep?.tipo_deporte || 'Otro'
      deportMap[dep] = (deportMap[dep] || 0) + r.precio_total
    })
    const byDeport = Object.entries(deportMap).map(([deport, amount]) => ({
      deport,
      amount
    }))

    // 5. Calcular porcentaje de variación comparado con el período anterior de igual duración
    let variationPercentage = 0
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      
      const prevStart = new Date(start.getTime() - diffTime)
      const prevEnd = new Date(end.getTime() - diffTime)

      const prevStartStr = prevStart.toISOString().split('T')[0]
      const prevEndStr = prevEnd.toISOString().split('T')[0]

      const comparison = await this.comparePeriods(prevStartStr, prevEndStr, startDate, endDate)
      variationPercentage = comparison.cambio_porcentual
    } catch (e) {
      console.error('Error al calcular variación:', e)
    }

    return {
      totalRevenue,
      averageReservation,
      totalReservations: totalResCount,
      variationPercentage,
      byDeport,
      dailyData
    }
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
  const { data } = await supabaseAdmin
    .from('reservas')
    .select('precio_total')
    .gte('fecha_empieza', `${startDate}T00:00:00Z`)
    .lte('fecha_empieza', `${endDate}T23:59:59Z`)
    .eq('estado', 'pagada')

  return (data || []).reduce((sum, r) => sum + r.precio_total, 0)
}

