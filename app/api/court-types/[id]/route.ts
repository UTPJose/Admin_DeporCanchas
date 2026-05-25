import { NextRequest, NextResponse } from 'next/server'
import { courtTypesService } from '@/services/court-types-service'

/**
 * PATCH /api/court-types/[id]  - Editar etiqueta o activar/desactivar { etiqueta?, activo? }
 */
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const data = await courtTypesService.updateType(parseInt(id, 10), {
      etiqueta: body.etiqueta,
      activo: body.activo,
    })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al actualizar tipo' },
      { status: 500 }
    )
  }
}
