import { NextRequest, NextResponse } from 'next/server'
import { paymentsService } from '@/services/payments-service'

/**
 * GET /api/payments/[id] - Obtener pago por ID
 * PUT /api/payments/[id] - Actualizar estado de pago
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const pago = await paymentsService.getPaymentById(parsedId)

    if (!pago) {
      return NextResponse.json({ success: false, error: 'Pago no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: pago,
    })
  } catch (error) {
    console.error('Error fetching payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener pago',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const body = await request.json()

    if (!body.estado) {
      return NextResponse.json({ success: false, error: 'Estado requerido' }, { status: 400 })
    }

    const updatedPago = await paymentsService.updatePaymentStatus(parsedId, body.estado)

    return NextResponse.json({
      success: true,
      data: updatedPago,
    })
  } catch (error) {
    console.error('Error updating payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar pago',
      },
      { status: 500 }
    )
  }
}
