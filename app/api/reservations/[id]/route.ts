import { NextRequest, NextResponse } from 'next/server'
import { reservationsService } from '@/services/reservations-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/reservations/[id] - Obtener reserva por ID
 * PATCH /api/reservations/[id] - Cancelar reserva (única acción admin sobre una reserva existente)
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const reservation = await reservationsService.getReservationById(parsedId)

    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error fetching reservation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener reserva',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)

    const cancelledReservation = await reservationsService.cancelReservation(parsedId)

    return NextResponse.json({
      success: true,
      data: cancelledReservation,
      message: 'Reserva cancelada exitosamente',
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error cancelling reservation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al cancelar reserva',
      },
      { status: 500 }
    )
  }
}
