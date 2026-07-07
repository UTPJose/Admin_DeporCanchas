import { NextRequest, NextResponse } from 'next/server'
import { campusService } from '@/services/campus-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/campus - Obtener todos los campus
 * POST /api/campus - Crear nuevo campus
 */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const campus = await campusService.getCampus()
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

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()

    if (!body.nombre || !body.ubicacion) {
      return NextResponse.json(
        { success: false, error: 'Nombre y ubicación requeridos' },
        { status: 400 }
      )
    }

    const newCampus = await campusService.createCampus({
      nombre: body.nombre,
      ubicacion: body.ubicacion,
      estado: body.estado || 'activo',
    })

    return NextResponse.json(
      {
        success: true,
        data: newCampus,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error creating campus:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear campus',
      },
      { status: 500 }
    )
  }
}
