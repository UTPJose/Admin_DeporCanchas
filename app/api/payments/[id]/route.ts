import { NextRequest, NextResponse } from 'next/server'
import { paymentsService } from '@/services/payments-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/payments/[id] - Obtener pago por ID
 *
 * El admin solo CONSULTA pagos (nunca los modifica).
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
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
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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
