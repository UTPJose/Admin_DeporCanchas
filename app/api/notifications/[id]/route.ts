import { NextRequest, NextResponse } from 'next/server'
import { notificationsService } from '@/services/notifications-service'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * PUT /api/notifications/[id] - Marcar notificación como leída
 * DELETE /api/notifications/[id] - Eliminar notificación
 */

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)
    const body = await request.json()

    if (body.action === 'mark-all-read') {
      // Marcar todas como leídas para un usuario
      await notificationsService.markAllAsRead(parsedId)
      return NextResponse.json({
        success: true,
        message: 'Todas las notificaciones marcadas como leídas',
      })
    }

    // Marcar una como leída
    const updatedNotification = await notificationsService.markAsRead(parsedId)

    return NextResponse.json({
      success: true,
      data: updatedNotification,
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error updating notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar notificación',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const parsedId = parseInt(id, 10)

    await notificationsService.deleteNotification(parsedId)

    return NextResponse.json({
      success: true,
      message: 'Notificación eliminada exitosamente',
    })
  } catch (error) {
    if (error instanceof UnauthorizedError) return unauthorizedResponse()
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar notificación',
      },
      { status: 500 }
    )
  }
}
