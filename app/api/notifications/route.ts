import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/services/notifications-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/notifications - Obtener notificaciones de un usuario
 * POST /api/notifications - Crear notificación
 */

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const audience = searchParams.get('audience') // 'admin' → notificaciones del panel

    // Notificaciones del panel admin (reservas pagadas / canceladas del cliente)
    if (audience === 'admin') {
      if (type === 'count') {
        const unread_count = await notificationsService.getAdminUnreadCount()
        return NextResponse.json({ success: true, data: { unread_count } })
      }
      const page = parseInt(searchParams.get('page') || '1', 10)
      const perPage = parseInt(searchParams.get('per_page') || '20', 10)
      const onlyUnread = searchParams.get('unread') === 'true'
      const res = await notificationsService.getAdminNotifications({ page, perPage, onlyUnread })
      return NextResponse.json({ success: true, data: res })
    }

    // Sin user_id → notificaciones recientes globales (dashboard admin)
    if (!userId) {
      const recientes = await notificationsService.getRecentNotifications(limit)
      return NextResponse.json({ success: true, type: 'recent', data: recientes })
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
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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
    await requireAdmin()
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
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
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
