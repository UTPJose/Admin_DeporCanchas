import { NextRequest, NextResponse } from 'next/server'
import { courtTypesService } from '@/services/court-types-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET  /api/court-types        - Listar tipos de cancha (?active=true → solo activos)
 * POST /api/court-types        - Crear tipo de cancha { etiqueta }
 */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const onlyActive = new URL(request.url).searchParams.get('active') === 'true'
    const data = await courtTypesService.getTypes(onlyActive)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al obtener tipos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    if (!body.etiqueta || typeof body.etiqueta !== 'string') {
      return NextResponse.json({ success: false, error: 'Etiqueta requerida' }, { status: 400 })
    }
    const data = await courtTypesService.createType(body.etiqueta)
    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al crear tipo' },
      { status: 500 }
    )
  }
}
