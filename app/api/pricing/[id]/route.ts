import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/pricing/[id] - Obtener tarifa por ID
 * PUT /api/pricing/[id] - Actualizar tarifa
 * DELETE /api/pricing/[id] - Eliminar tarifa
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const tarifa = await pricingService.getTarifaById(parsedId)

    if (!tarifa) {
      return NextResponse.json({ success: false, error: 'Tarifa no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: tarifa,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const body = await request.json()

    const updatedTarifa = await pricingService.updatePricingRule(parsedId, {
      nombre: body.nombre,
      dias: Array.isArray(body.dias) ? body.dias.map(Number) : null,
      hora_empieza: body.hora_empieza ?? null,
      hora_termina: body.hora_termina ?? null,
      fecha_empieza: body.fecha_empieza ?? null,
      fecha_termina: body.fecha_termina ?? null,
      precio: Number(body.precio),
      prioridad: Number(body.prioridad),
    })

    return NextResponse.json({
      success: true,
      data: updatedTarifa,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)

    await pricingService.deletePricingRule(parsedId)

    return NextResponse.json({
      success: true,
      message: 'Tarifa eliminada exitosamente',
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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
