import { NextRequest, NextResponse } from 'next/server'
import { schedulesService } from '@/services/schedules-service'

/**
 * GET /api/schedules - Obtener horarios
 * POST /api/schedules - Crear bloqueo de horario
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'availability'
    const courtId = searchParams.get('court_id')
    const weekStart = searchParams.get('week_start')
    const weekEnd = searchParams.get('week_end')

    if (!courtId) {
      return NextResponse.json(
        { success: false, error: 'court_id requerido' },
        { status: 400 }
      )
    }

    const cid = parseInt(courtId, 10)
    let response: any

    switch (action) {
      case 'availability':
        response = await schedulesService.getCourtAvailability(cid)
        break

      case 'blocked':
        if (!weekStart || !weekEnd) {
          return NextResponse.json(
            { success: false, error: 'week_start y week_end requeridos' },
            { status: 400 }
          )
        }
        response = await schedulesService.getBlockedSchedules(cid, weekStart, weekEnd)
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Acción no válida' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      action,
      data: response,
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener horarios',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || 'block'

    if (action === 'block') {
      if (!body.court_id || !body.start_date || !body.end_date) {
        return NextResponse.json(
          {
            success: false,
            error: 'court_id, start_date y end_date requeridos',
          },
          { status: 400 }
        )
      }

      const blocked = await schedulesService.blockSchedule(
        body.court_id,
        body.start_date,
        body.end_date,
        body.reason
      )

      return NextResponse.json(
        {
          success: true,
          data: blocked,
        },
        { status: 201 }
      )
    }

    if (action === 'availability') {
      if (!body.court_id || !body.day_of_week || !body.start_time || !body.end_time) {
        return NextResponse.json(
          {
            success: false,
            error: 'court_id, day_of_week, start_time y end_time requeridos',
          },
          { status: 400 }
        )
      }

      const availability = await schedulesService.createAvailability(
        body.court_id,
        body.day_of_week,
        body.start_time,
        body.end_time
      )

      return NextResponse.json(
        {
          success: true,
          data: availability,
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Acción no válida' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear horario',
      },
      { status: 500 }
    )
  }
}
