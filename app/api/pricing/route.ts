import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'

/**
 * GET /api/pricing - Obtener todas las tarifas
 * POST /api/pricing - Crear nueva tarifa
 */

export async function GET(request: NextRequest) {
  try {
    const tarifas = await pricingService.getTarifas()

    return NextResponse.json({
      success: true,
      data: tarifas,
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tarifas',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.nombre || body.precio === undefined || body.prioridad === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre, precio y prioridad requeridos',
        },
        { status: 400 }
      )
    }

    const newTarifa = await pricingService.createTarifa({
      nombre: body.nombre,
      hora_empieza: body.hora_empieza,
      hora_termina: body.hora_termina,
      fecha_empieza: body.fecha_empieza,
      fecha_termina: body.fecha_termina,
      precio: body.precio,
      prioridad: body.prioridad,
    })

    return NextResponse.json(
      {
        success: true,
        data: newTarifa,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating pricing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear tarifa',
      },
      { status: 500 }
    )
  }
}
