import { NextRequest, NextResponse } from 'next/server'
import { courtsService } from '@/services/courts-service'
import { schedulesService } from '@/services/schedules-service'

/**
 * GET /api/courts/[id] - Obtener cancha por ID
 * PUT /api/courts/[id] - Actualizar cancha
 * DELETE /api/courts/[id] - Eliminar cancha
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const courtId = parseInt(id, 10)
    const court = await courtsService.getCourtById(courtId)

    if (!court) {
      return NextResponse.json({ success: false, error: 'Cancha no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: court,
    })
  } catch (error) {
    console.error('Error fetching court:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener cancha',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const courtId = parseInt(id, 10)
    const body = await request.json()
    // El form puede incluir `id`/campos no-columna y campos de horario que no
    // pertenecen a canchas_deportivas (van a cancha_disponibilidad). Los separamos.
    const {
      id: _ignore,
      campus: _c,
      cancha_disponibilidad: _d,
      tarifas_canchasdep: _t,
      hora_abre,
      hora_cierra,
      ...updates
    } = body

    const updatedCourt = await courtsService.updateCourt(courtId, updates)

    // Si el form trae nuevo horario, reemplazamos la disponibilidad (7 días, mismo rango).
    if (hora_abre && hora_cierra) {
      try {
        await schedulesService.replaceAvailability(courtId, hora_abre, hora_cierra)
      } catch (e) {
        console.error('updateCourt: fallo al reemplazar disponibilidad', e)
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedCourt,
    })
  } catch (error) {
    console.error('Error updating court:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar cancha',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const courtId = parseInt(id, 10)

    await courtsService.deleteCourt(courtId)

    return NextResponse.json({
      success: true,
      message: 'Cancha eliminada exitosamente',
    })
  } catch (error) {
    console.error('Error deleting court:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar cancha',
      },
      { status: 500 }
    )
  }
}

