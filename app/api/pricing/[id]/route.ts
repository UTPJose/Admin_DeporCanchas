import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'

/**
 * GET /api/pricing/[id] - Obtener tarifa por ID
 * PUT /api/pricing/[id] - Actualizar tarifa
 * DELETE /api/pricing/[id] - Eliminar tarifa
 */

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    const tarifa = await pricingService.getTarifaById(id)

    if (!tarifa) {
      return NextResponse.json({ success: false, error: 'Tarifa no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: tarifa,
    })
  } catch (error) {
    console.error('Error fetching pricing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener tarifa',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)
    const body = await request.json()

    const updatedTarifa = await pricingService.updateTarifa(id, body)

    return NextResponse.json({
      success: true,
      data: updatedTarifa,
    })
  } catch (error) {
    console.error('Error updating pricing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar tarifa',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id, 10)

    await pricingService.deleteTarifa(id)

    return NextResponse.json({
      success: true,
      message: 'Tarifa eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error deleting pricing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar tarifa',
      },
      { status: 500 }
    )
  }
}
