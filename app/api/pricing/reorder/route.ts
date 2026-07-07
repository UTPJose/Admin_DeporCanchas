import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * POST /api/pricing/reorder - Reordena reglas por arrastre.
 * Body: { ids: number[] } en el orden deseado (primero = mayor prioridad).
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (!Array.isArray(body.ids)) {
      return NextResponse.json({ success: false, error: 'ids[] requerido' }, { status: 400 })
    }
    await pricingService.reorderRules(body.ids.map(Number))
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al reordenar' },
      { status: 500 }
    )
  }
}
