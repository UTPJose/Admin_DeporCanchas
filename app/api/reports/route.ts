import { NextRequest, NextResponse } from 'next/server'
import { reportsService } from '@/services/reports-service'
import { limaYMD, addDaysYMD, limaToUtcISO } from '@/lib/lima-time'
import {
  requireAdmin,
  requireSuperAdmin,
  UnauthorizedError,
  ForbiddenError,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/auth/requireAdmin'

/**
 * GET /api/reports/dashboard - Obtener estadísticas del dashboard (cualquier admin)
 * GET /api/reports/by-deport - Reservas por deporte, usado en el dashboard (cualquier admin)
 * GET /api/reports/revenue - Ingresos por período:
 *   - solo `period` (sin startDate/endDate): resumen rápido del dashboard, cualquier admin.
 *   - con startDate/endDate: análisis detallado de la página /reportes, SOLO super-admin.
 * GET /api/reports/by-property, /top-users, /compare - Análisis avanzado, SOLO super-admin
 * (misma restricción que gestionar administradores, ver lib/auth/requireAdmin.ts).
 */

const SUPER_ADMIN_ONLY_TYPES = new Set(['by-property', 'top-users', 'compare'])

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // La página /reportes (análisis detallado) exige super-admin; el dashboard
    // general (type=dashboard/by-deport, o revenue sin rango de fechas) queda
    // abierto a cualquier admin.
    const esAnalisisDetallado =
      SUPER_ADMIN_ONLY_TYPES.has(type) || (type === 'revenue' && !!startDate && !!endDate)

    try {
      if (esAnalisisDetallado) {
        await requireSuperAdmin()
      } else {
        await requireAdmin()
      }
    } catch (e) {
      if (e instanceof UnauthorizedError) return unauthorizedResponse()
      if (e instanceof ForbiddenError) return forbiddenResponse()
      throw e
    }

    let response: any

    switch (type) {
      case 'dashboard':
        response = await reportsService.getDashboardStats()
        break

      case 'revenue': {
        const period = searchParams.get('period')
        let from = startDate
        let to = endDate
        if ((!from || !to) && period) {
          // Calculamos rangos anclados a hora Lima para que `day` realmente
          // signifique "hoy en Lima" y no "hoy en UTC del server".
          const todayLima = limaYMD()
          if (period === 'day') {
            from = limaToUtcISO(todayLima, '00:00:00')
            to = limaToUtcISO(addDaysYMD(todayLima, 1), '00:00:00')
          } else {
            const days = period === 'month' ? 30 : 7
            const fromYmd = addDaysYMD(todayLima, -(days - 1))
            from = limaToUtcISO(fromYmd, '00:00:00')
            to = limaToUtcISO(addDaysYMD(todayLima, 1), '00:00:00')
          }
        }
        if (!from || !to) {
          return NextResponse.json(
            { success: false, error: 'startDate/endDate o period requeridos' },
            { status: 400 }
          )
        }
        response = await reportsService.getRevenueReport(from, to)
        break
      }

      case 'by-deport':
        response = await reportsService.getReservationsByDeport()
        break

      case 'by-property':
        response = await reportsService.getRevenueByProperty()
        break

      case 'top-users':
        const limit = parseInt(searchParams.get('limit') || '10', 10)
        response = await reportsService.getTopUsers(limit)
        break

      case 'compare':
        if (!startDate || !endDate) {
          return NextResponse.json(
            { success: false, error: 'Todos los parámetros de fecha son requeridos' },
            { status: 400 }
          )
        }
        const startDate2 = searchParams.get('startDate2')
        const endDate2 = searchParams.get('endDate2')
        if (!startDate2 || !endDate2) {
          return NextResponse.json(
            { success: false, error: 'startDate2 y endDate2 requeridos' },
            { status: 400 }
          )
        }
        response = await reportsService.comparePeriods(startDate, endDate, startDate2, endDate2)
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Tipo de reporte no válido' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      type,
      data: response,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error fetching report:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reporte',
      },
      { status: 500 }
    )
  }
}
