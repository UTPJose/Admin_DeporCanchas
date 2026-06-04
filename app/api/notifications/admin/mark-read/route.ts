import { NextResponse } from 'next/server'
import { notificationsService } from '@/services/notifications-service'

/**
 * POST /api/notifications/admin/mark-read - Marca como leídas todas las
 * notificaciones del panel admin (las que tienen prefijo de tipo `admin_`).
 * Se invoca cuando el admin abre la campana o la página de notificaciones.
 */
export async function POST() {
  try {
    await notificationsService.markAllAdminRead()
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error' },
      { status: 500 }
    )
  }
}
