import { supabaseAdmin as supabase } from '@/lib/supabase'
import { DashboardKPI, DashboardStats } from '@/types/database'
import { limaYMD, addDaysYMD, weekStartYMD, limaToUtcISO } from '@/lib/lima-time'

/**
 * Reports Service - Análisis y estadísticas
 */

export interface RevenueReport {
  totalRevenue: number
  totalReservations: number
  averageReservation: number
  /** % vs período anterior de igual duración. `null` cuando no hay base de comparación. */
  variationPercentage: number | null
  /** true si el período anterior tuvo 0 ingresos (mostrar "Nuevo" en UI). */
  previousEmpty: boolean
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
    const previousEmpty = prevRevenue <= 0
    const variationPercentage = previousEmpty
      ? null
      : ((totalRevenue - prevRevenue) / prevRevenue) * 100

    return {
      totalRevenue,
      totalReservations,
      averageReservation,
      variationPercentage,
      previousEmpty,
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
   * Estadísticas del dashboard: comparación mes actual vs mes anterior.
   *
   * - Total usuarios: histórico acumulado (sin variación).
   * - Usuarios mes: nuevos registros este mes (creado_en) vs mes anterior.
   * - Reservas mes: reservas con estado='pagada' este mes (creado_en) vs mes anterior.
   * - Ingresos mes: suma de precio_total de pagadas este mes vs mes anterior.
   * - Pendientes actual: reservas en estado='pendiente' ahora.
   * - Reservas por día: cantidad pagada por cada día de la semana corriente
   *   (lunes-domingo en hora Lima), incluso días con 0 para que el chart
   *   pinte la semana completa.
   *
   * Las % de variación usan el rango [inicio_mes_anterior, inicio_mes_actual).
   * Cuando el período anterior es 0 se devuelve `previousEmpty=true` para que
   * la UI muestre "Nuevo" en vez de un 0% engañoso.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const todayLima = limaYMD()
    const [yearStr, monthStr] = todayLima.split('-')
    const year = Number(yearStr)
    const month = Number(monthStr) // 1-12

    // Rangos del mes actual y anterior (instantes UTC)
    const startOfMonthYmd = `${yearStr}-${monthStr}-01`
    const startOfMonthUtc = limaToUtcISO(startOfMonthYmd, '00:00:00')

    const prevYear = month === 1 ? year - 1 : year
    const prevMonth = month === 1 ? 12 : month - 1
    const startOfPrevMonthYmd = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`
    const startOfPrevMonthUtc = limaToUtcISO(startOfPrevMonthYmd, '00:00:00')

    const buildKPI = (current: number, prev: number): DashboardKPI => {
      const previousEmpty = prev <= 0
      let variacion: number | null = null
      if (!previousEmpty) variacion = ((current - prev) / prev) * 100
      return { valor: current, variacion, previousEmpty }
    }

    // --- Total usuarios (histórico) ---
    const { count: totalUsuarios } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })

    // --- Usuarios nuevos este mes vs anterior ---
    const { count: usuariosMesCount } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .gte('creado_en', startOfMonthUtc)
    const { count: usuariosMesPrevCount } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .gte('creado_en', startOfPrevMonthUtc)
      .lt('creado_en', startOfMonthUtc)

    // --- Reservas pagadas este mes vs anterior (por fecha_empieza) ---
    const { data: reservasMesData } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', startOfMonthUtc)
    const { data: reservasMesPrevData } = await supabase
      .from('reservas')
      .select('precio_total')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', startOfPrevMonthUtc)
      .lt('fecha_empieza', startOfMonthUtc)

    const reservasMesCount = (reservasMesData || []).length
    const reservasMesPrevCount = (reservasMesPrevData || []).length
    const ingresosMes = (reservasMesData || []).reduce((s, r) => s + (r.precio_total || 0), 0)
    const ingresosMesPrev = (reservasMesPrevData || []).reduce((s, r) => s + (r.precio_total || 0), 0)

    // --- Pendientes actual ---
    const { count: pendientes } = await supabase
      .from('reservas')
      .select('*', { count: 'exact', head: true })
      .eq('estado', 'pendiente')

    // --- Reservas por día de la semana corriente (Lima) ---
    const weekStart = weekStartYMD(todayLima) // lunes (YMD Lima)
    const weekEndYmd = addDaysYMD(weekStart, 6)
    const weekStartUtc = limaToUtcISO(weekStart, '00:00:00')
    const weekEndUtc = limaToUtcISO(addDaysYMD(weekEndYmd, 1), '00:00:00')

    const { data: reservasSemana } = await supabase
      .from('reservas')
      .select('fecha_empieza')
      .eq('estado', 'pagada')
      .gte('fecha_empieza', weekStartUtc)
      .lt('fecha_empieza', weekEndUtc)

    // Inicializar todos los días con 0 para que el chart pinte la semana entera
    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const counts: Record<string, number> = {}
    for (let i = 0; i < 7; i++) counts[addDaysYMD(weekStart, i)] = 0
    ;(reservasSemana || []).forEach((r) => {
      const dia = limaYMD(r.fecha_empieza)
      if (dia in counts) counts[dia] += 1
    })
    const reservasPorDia = Object.entries(counts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ymd, cantidad], idx) => ({ dia: dayLabels[idx], ymd, cantidad }))
      .map(({ dia, cantidad }) => ({ dia, cantidad }))

    return {
      total_usuarios: totalUsuarios || 0,
      usuarios_mes: buildKPI(usuariosMesCount || 0, usuariosMesPrevCount || 0),
      reservas_mes: buildKPI(reservasMesCount, reservasMesPrevCount),
      ingresos_mes: buildKPI(ingresosMes, ingresosMesPrev),
      pendientes_actual: pendientes || 0,
      reservas_por_dia: reservasPorDia,
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
