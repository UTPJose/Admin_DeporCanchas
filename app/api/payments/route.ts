import { NextRequest, NextResponse } from 'next/server'
import { paymentsService } from '@/services/payments-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/payments - Obtener todos los pagos
 *
 * El admin solo CONSULTA pagos/vouchers/historial — nunca los crea ni modifica
 * (los emite y los escribe el cliente al pagar; el trigger llena el historial).
 */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const pagos = await paymentsService.getPayments()

    return NextResponse.json({
      success: true,
      data: pagos,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener pagos',
      },
      { status: 500 }
    )
  }
}
