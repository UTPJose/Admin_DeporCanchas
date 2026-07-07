import { NextRequest, NextResponse } from 'next/server'
import { pricingService } from '@/services/pricing-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET  /api/pricing?court_id=  - Reglas de una cancha (ordenadas por prioridad)
 * POST /api/pricing            - Crear regla en una cancha (court_id) o
 *                                inyectar en varias (court_ids[], queda primera)
 */

function ruleInput(body: any) {
  return {
    nombre: body.nombre,
    dias: Array.isArray(body.dias) ? body.dias.map(Number) : null,
    hora_empieza: body.hora_empieza ?? null,
    hora_termina: body.hora_termina ?? null,
    fecha_empieza: body.fecha_empieza ?? null,
    fecha_termina: body.fecha_termina ?? null,
    precio: Number(body.precio),
    prioridad: Number(body.prioridad) || 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const courtId = new URL(request.url).searchParams.get('court_id')
    const data = courtId ? await pricingService.getCourtPricingRules(parseInt(courtId, 10)) : []
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al obtener tarifas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (body.precio === undefined || body.precio === null || Number.isNaN(Number(body.precio))) {
      return NextResponse.json({ success: false, error: 'Precio requerido' }, { status: 400 })
    }

    const input = ruleInput(body)

    // Inyección a varias canchas (vista Por Campus): copia independiente, queda primera
    if (Array.isArray(body.court_ids) && body.court_ids.length) {
      const count = await pricingService.injectRuleToCourts(body.court_ids.map(Number), input)
      return NextResponse.json({ success: true, data: { canchas: count } }, { status: 201 })
    }

    // Regla en una cancha (vista Por Cancha)
    if (!body.court_id) {
      return NextResponse.json({ success: false, error: 'court_id o court_ids requerido' }, { status: 400 })
    }
    const data = await pricingService.createCourtPricingRule(Number(body.court_id), input)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al crear tarifa' },
      { status: 500 }
    )
  }
}
