import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'

/**
 * POST /api/pricing/reorder - Reordena reglas por arrastre.
 * Body: { ids: number[] } en el orden deseado (primero = mayor prioridad).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ success: false, error: 'ids[] requerido' }, { status: 400 })
    }
    await pricingService.reorderRules(body.ids.map(Number))
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al reordenar' },
      { status: 500 }
    )
  }
}
