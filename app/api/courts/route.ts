import { NextRequest, NextResponse } from 'next/server'
import { courtsService } from '@/services/courts-service'
import { schedulesService } from '@/services/schedules-service'

/**
 * GET /api/courts - Obtener todas las canchas con filtros opcionales
 * POST /api/courts - Crear nueva cancha
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campusId = searchParams.get('campus_id')
    const tipoDeporte = searchParams.get('tipo_deporte')
    const estado = searchParams.get('estado')

    const courts = await courtsService.getCourts({
      campus_id: campusId ? parseInt(campusId, 10) : undefined,
      tipo_deporte: tipoDeporte as any,
      estado: estado as any,
    })

    return NextResponse.json({
      success: true,
      data: courts,
    })
  } catch (error) {
    console.error('Error fetching courts:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener canchas',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.campus_id || !body.nombre || !body.tipo_deporte || !body.cantidad_jugadores) {
      return NextResponse.json(
        {
          success: false,
          error: 'Campus, nombre, tipo de deporte y cantidad de jugadores requeridos',
        },
        { status: 400 }
      )
    }

    const courtPayload: Record<string, unknown> = {
      campus_id: body.campus_id,
      nombre: body.nombre,
      tipo_deporte: body.tipo_deporte,
      cantidad_jugadores: body.cantidad_jugadores,
      estado: body.estado || 'activo',
      imagen_url: body.imagen_url ?? null,
    }
    if (body.precio_default !== undefined && body.precio_default !== null && body.precio_default !== '') {
      courtPayload.precio_default = Number(body.precio_default)
    }
    const newCourt = await courtsService.createCourt(courtPayload as any)

    // Disponibilidad inicial (7 días). Toma hora_abre/hora_cierra del body o usa 08-22.
    // Sin esto la cancha sale "bloqueada" en todos los slots para el cliente.
    const horaAbre = body.hora_abre || '08:00:00'
    const horaCierra = body.hora_cierra || '22:00:00'
    try {
      await schedulesService.replaceAvailability(newCourt.id, horaAbre, horaCierra)
    } catch (e) {
      console.error('createCourt: fallo al crear disponibilidad', e)
    }

    return NextResponse.json(
      {
        success: true,
        data: newCourt,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating court:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear cancha',
      },
      { status: 500 }
    )
  }
}
