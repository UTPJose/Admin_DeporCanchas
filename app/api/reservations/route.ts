import { NextRequest, NextResponse } from 'next/server'
import { reservationsService } from '@/services/reservations-service'

/**
 * GET /api/reservations - Obtener todas las reservas con filtros
 * POST /api/reservations - Crear nueva reserva
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const estado = searchParams.get('estado')
    const campusId = searchParams.get('campus_id')
    const fechaInicio = searchParams.get('fecha_inicio')
    const fechaFin = searchParams.get('fecha_fin')
    const usuarioEmail = searchParams.get('usuario_email')

    const reservations = await reservationsService.getReservations({
      page,
      limit,
      estado: estado as any,
      campus_id: campusId ? parseInt(campusId, 10) : undefined,
      fecha_inicio: fechaInicio || undefined,
      fecha_fin: fechaFin || undefined,
      usuario_email: usuarioEmail || undefined,
    })

    return NextResponse.json({
      success: true,
      data: reservations,
      page,
      limit,
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reservas',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.canchasdep_id || !body.usuarios_id || !body.fecha_empieza || !body.fecha_termina) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cancha, usuario, fechas y precio requeridos',
        },
        { status: 400 }
      )
    }

    const newReservation = await reservationsService.createReservation({
      canchasdep_id: body.canchasdep_id,
      usuarios_id: body.usuarios_id,
      fecha_empieza: body.fecha_empieza,
      fecha_termina: body.fecha_termina,
      precio_total: body.precio_total,
      estado: body.estado || 'pendiente',
    })

    return NextResponse.json(
      {
        success: true,
        data: newReservation,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear reserva',
      },
      { status: 500 }
    )
  }
}
