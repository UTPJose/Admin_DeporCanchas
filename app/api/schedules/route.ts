import { NextRequest, NextResponse } from 'next/server'
import { schedulesService } from '@/services/schedules-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

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
      // El bloqueo se registra a nombre del admin logueado que lo crea.
      let admin
      try {
        admin = await requireAdmin()
      } catch (e) {
        if (e instanceof UnauthorizedError) return unauthorizedResponse()
        throw e
      }

      const faltan = (['court_id', 'start_date', 'end_date'] as const).filter((k) => !body[k])
      if (faltan.length) {
        // Loguea el body recibido para diagnosticar problemas raros (campo perdido,
        // tipo incorrecto, etc.) — el usuario puede pasarnos el log si vuelve a pasar.
        console.error('schedules POST: faltan campos', { faltan, body })
        return NextResponse.json(
          {
            success: false,
            error: `Faltan datos para crear el bloqueo: ${faltan.join(', ')}`,
            received: { court_id: body.court_id, start_date: body.start_date, end_date: body.end_date },
          },
          { status: 400 }
        )
      }

      const blocked = await schedulesService.blockSchedule(
        body.court_id,
        body.start_date,
        body.end_date,
        admin.id,
        body.reason,
        body.all_day
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

export async function PATCH(request: NextRequest) {
  try {
    // Cualquier admin puede editar un bloqueo.
    try {
      await requireAdmin()
    } catch (e) {
      if (e instanceof UnauthorizedError) return unauthorizedResponse()
      throw e
    }

    const body = await request.json()
    if (!body.id || !body.start_date || !body.end_date) {
      return NextResponse.json(
        { success: false, error: 'id, start_date y end_date requeridos' },
        { status: 400 }
      )
    }

    const updated = await schedulesService.updateBlock(
      parseInt(String(body.id), 10),
      body.start_date,
      body.end_date,
      body.reason
    )

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al editar bloqueo',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id requerido para desbloquear' },
        { status: 400 }
      )
    }

    await schedulesService.unblockSchedule(parseInt(id, 10))

    return NextResponse.json({
      success: true,
      message: 'Horario desbloqueado correctamente',
    })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al desbloquear horario',
      },
      { status: 500 }
    )
  }
}
