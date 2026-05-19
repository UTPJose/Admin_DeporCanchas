import { NextRequest, NextResponse } from 'next/server'
import { paymentsService } from '@/services/payments-service'

/**
 * GET /api/payments - Obtener todos los pagos
 * POST /api/payments - Crear nuevo pago
 */

export async function GET(request: NextRequest) {
  try {
    const pagos = await paymentsService.getPayments()

    return NextResponse.json({
      success: true,
      data: pagos,
    })
  } catch (error) {
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.reserva_id || body.monto === undefined || !body.estado || !body.metodo_pago) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva, monto, estado y método de pago requeridos',
        },
        { status: 400 }
      )
    }

    const newPago = await paymentsService.createPayment({
      reserva_id: body.reserva_id,
      monto: body.monto,
      estado: body.estado,
      metodo_pago: body.metodo_pago,
      voucher_url: body.voucher_url ?? body.receipt_url ?? null,
      voucher_serie: body.voucher_serie ?? null,
      voucher_correlativo: body.voucher_correlativo ?? null,
      comprobante_yape_url: body.comprobante_yape_url ?? null,
      card_brand: body.card_brand,
      card_last4: body.card_last4,
      titular_nombre: body.titular_nombre ?? null,
      titular_dni: body.titular_dni ?? null,
      titular_direccion: body.titular_direccion ?? null,
      titular_fecha_nacimiento: body.titular_fecha_nacimiento ?? null,
      simulated: body.simulated ?? true,
    })

    return NextResponse.json(
      {
        success: true,
        data: newPago,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear pago',
      },
      { status: 500 }
    )
  }
}
