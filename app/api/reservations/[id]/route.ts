import { NextRequest, NextResponse } from 'next/server'
import { reservationsService } from '@/services/reservations-service'

/**
 * GET /api/reservations/[id] - Obtener reserva por ID
 * PUT /api/reservations/[id] - Actualizar reserva
 * DELETE /api/reservations/[id] - Cancelar reserva
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    const reservation = await reservationsService.getReservationById(id)

    if (!reservation) {
      return NextResponse.json({ success: false, error: 'Reserva no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: reservation,
    })
  } catch (error) {
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    const body = await request.json()

    const updatedReservation = await reservationsService.updateReservation(id, body)

    return NextResponse.json({
      success: true,
      data: updatedReservation,
    })
  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar reserva',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)

    const cancelledReservation = await reservationsService.cancelReservation(id)

    return NextResponse.json({
      success: true,
      data: cancelledReservation,
      message: 'Reserva cancelada exitosamente',
    })
  } catch (error) {
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
