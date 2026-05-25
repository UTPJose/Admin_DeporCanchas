import { NextRequest, NextResponse } from 'next/server'
import { reportsService } from '@/services/reports-service'

/**
 * GET /api/reports/dashboard - Obtener estadísticas del dashboard
 * GET /api/reports/revenue - Obtener ingresos por período
 * GET /api/reports/by-deport - Obtener reservas por deporte
 * GET /api/reports/by-property - Obtener ingresos por cancha
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'dashboard'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

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
          const now = new Date()
          const days = period === 'month' ? 30 : 7
          to = now.toISOString()
          from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString()
        }
        if (!from || !to) {
          return NextResponse.json(
            { success: false, error: 'startDate/endDate o period requeridos' },
            { status: 400 }
          )
        }
        response = await reportsService.getRevenueByPeriod(from, to)
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
