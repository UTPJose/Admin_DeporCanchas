import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * POST /api/pricing/default - Fija precio_default en varias canchas (masivo, Por Campus).
 * Body: { court_ids: number[], precio_default: number }
 */
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (!Array.isArray(body.court_ids) || body.court_ids.length === 0) {
      return NextResponse.json({ success: false, error: 'court_ids[] requerido' }, { status: 400 })
    }
    if (body.precio_default === undefined || Number.isNaN(Number(body.precio_default))) {
      return NextResponse.json({ success: false, error: 'precio_default requerido' }, { status: 400 })
    }
    await pricingService.bulkSetDefault(body.court_ids.map(Number), Number(body.precio_default))
    return NextResponse.json({ success: true, data: { canchas: body.court_ids.length } })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al actualizar default' },
      { status: 500 }
    )
  }
}
