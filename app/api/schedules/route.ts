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

      // ---- Expansión de repetición ----
      // Si `repetition` es daily/weekly/monthly y hay `repeat_until`,
      // generamos las ocurrencias y creamos un bloqueo por cada una.
      // `all_day=true` desactiva repetición (la UI lo oculta también).
      const rep: 'no_repeat' | 'daily' | 'weekly' | 'monthly' =
        body.all_day ? 'no_repeat' : body.repetition ?? 'no_repeat'
      const occurrences: Array<{ start: string; end: string }> = []
      if (rep === 'no_repeat' || !body.repeat_until) {
        occurrences.push({ start: body.start_date, end: body.end_date })
      } else {
        const startD0 = new Date(body.start_date)
        const endD0 = new Date(body.end_date)
        // Tope final = 23:59:59 UTC de repeat_until (acepta YYYY-MM-DD).
        const untilD = new Date(`${body.repeat_until}T23:59:59Z`)
        const MAX_OCCURRENCES = 60
        const stepDays = rep === 'daily' ? 1 : rep === 'weekly' ? 7 : 0 // monthly → setMonth
        let s = new Date(startD0)
        let e = new Date(endD0)
        while (s <= untilD && occurrences.length < MAX_OCCURRENCES) {
          occurrences.push({ start: s.toISOString(), end: e.toISOString() })
          if (rep === 'monthly') {
            const sn = new Date(s); sn.setMonth(sn.getMonth() + 1)
            const en = new Date(e); en.setMonth(en.getMonth() + 1)
            s = sn; e = en
          } else {
            s = new Date(s.getTime() + stepDays * 86400000)
            e = new Date(e.getTime() + stepDays * 86400000)
          }
        }
      }

      const created: unknown[] = []
      const failed: Array<{ start: string; error: string }> = []
      for (const occ of occurrences) {
        try {
          const row = await schedulesService.blockSchedule(
            body.court_id,
            occ.start,
            occ.end,
            admin.id,
            body.reason,
            body.all_day
          )
          created.push(row)
        } catch (e) {
          // Si un slot ya está reservado/ocupado, lo saltamos sin abortar
          // el resto de la serie. El usuario verá cuántos se crearon.
          failed.push({ start: occ.start, error: e instanceof Error ? e.message : String(e) })
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: created,
          created: created.length,
          skipped: failed.length,
          repetition: rep,
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
