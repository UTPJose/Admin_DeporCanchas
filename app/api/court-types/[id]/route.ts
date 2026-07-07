import { NextRequest, NextResponse } from 'next/server'
import { courtTypesService } from '@/services/court-types-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * PATCH /api/court-types/[id]  - Editar etiqueta o activar/desactivar { etiqueta?, activo? }
 */
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await ctx.params
    const body = await request.json()
    const data = await courtTypesService.updateType(parseInt(id, 10), {
      etiqueta: body.etiqueta,
      activo: body.activo,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al actualizar tipo' },
      { status: 500 }
    )
  }
}
