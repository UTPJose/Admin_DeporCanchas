import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/services/notifications-service'

/**
 * GET /api/notifications - Obtener notificaciones de un usuario
 * POST /api/notifications - Crear notificación
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'user_id requerido' },
        { status: 400 }
      )
    }

    const uid = parseInt(userId, 10)
    let notifications: any

    if (type === 'unread') {
      notifications = await notificationsService.getUnreadNotifications(uid)
    } else if (type === 'count') {
      const count = await notificationsService.getUnreadCount(uid)
      return NextResponse.json({
        success: true,
        data: { unread_count: count },
      })
    } else {
      notifications = await notificationsService.getNotifications(uid, limit)
    }

    return NextResponse.json({
      success: true,
      type,
      data: notifications,
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener notificaciones',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.usuarios_id || !body.tipo || !body.titulo || !body.mensaje) {
      return NextResponse.json(
        {
          success: false,
          error: 'usuarios_id, tipo, titulo y mensaje requeridos',
        },
        { status: 400 }
      )
    }

    const newNotification = await notificationsService.createNotification({
      usuarios_id: body.usuarios_id,
      tipo: body.tipo,
      titulo: body.titulo,
      mensaje: body.mensaje,
      leido: false,
    })

    return NextResponse.json(
      {
        success: true,
        data: newNotification,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear notificación',
      },
      { status: 500 }
    )
  }
}
