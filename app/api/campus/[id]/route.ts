import { NextRequest, NextResponse } from 'next/server'
import { campusService } from '@/services/campus-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/campus/[id] - Obtener campus por ID
 * PUT /api/campus/[id] - Actualizar campus
 * DELETE /api/campus/[id] - Eliminar campus
 */

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const campusId = parseInt(id, 10)
    const campus = await campusService.getCampusById(campusId)

    if (!campus) {
      return NextResponse.json({ success: false, error: 'Campus no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: campus,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error fetching campus:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener campus',
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const campusId = parseInt(id, 10)
    const body = await request.json()
    const { id: _ignore, ...updates } = body

    const updatedCampus = await campusService.updateCampus(campusId, updates)

    return NextResponse.json({
      success: true,
      data: updatedCampus,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error updating campus:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar campus',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const campusId = parseInt(id, 10)

    await campusService.deleteCampus(campusId)

    return NextResponse.json({
      success: true,
      message: 'Campus eliminado exitosamente',
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error deleting campus:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar campus',
      },
      { status: 500 }
    )
  }
}
