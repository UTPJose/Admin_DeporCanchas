import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

export const runtime = 'nodejs'

/**
 * POST /api/courts/image - Sube una imagen de cancha al bucket 'canchas' (público).
 * Multipart con campo `file`. Devuelve { url } para guardar en canchas_deportivas.imagen_url.
 * La subida usa service_role (server-only); el cliente nunca ve la key.
 */
export async function POST(request: NextRequest) {
  try {
    try {
      await requireAdmin()
    } catch (e) {
      if (e instanceof UnauthorizedError) return unauthorizedResponse()
      throw e
    }

    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ success: false, error: 'Archivo requerido' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, error: 'El archivo debe ser una imagen' }, { status: 400 })
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'Imagen muy grande (máx 5MB)' }, { status: 400 })
    }

    const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
    const path = `court-${randomUUID()}.${ext}`
    const buf = Buffer.from(await file.arrayBuffer())

    const { error: upErr } = await supabaseAdmin.storage
      .from('canchas')
      .upload(path, buf, { contentType: file.type, upsert: false })
    if (upErr) {
      return NextResponse.json({ success: false, error: upErr.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from('canchas').getPublicUrl(path)
    return NextResponse.json({ success: true, url: data.publicUrl })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al subir imagen' },
      { status: 500 }
    )
  }
}
