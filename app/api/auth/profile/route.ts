import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * PUT /api/auth/profile - Actualiza nombre/email del admin logueado.
 * Si el email cambia, valida que no esté en uso por otro usuario.
 */
export async function PUT(request: NextRequest) {
  let admin
  try {
    admin = await requireAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  try {
    const body = await request.json()
    const nombre: string = (body.nombre ?? '').toString().trim()
    const email: string = (body.email ?? '').toString().trim().toLowerCase()

    if (nombre.length < 3) {
      return NextResponse.json({ success: false, error: 'Nombre muy corto' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email inválido' }, { status: 400 })
    }

    // Si el email cambia, chequear unicidad
    if (email !== admin.email) {
      const { data: existing } = await supabaseAdmin
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .maybeSingle()
      if (existing && existing.id !== admin.id) {
        return NextResponse.json(
          { success: false, error: 'Ese email ya está en uso por otro usuario.' },
          { status: 409 }
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('usuarios')
      .update({ nombre, email })
      .eq('id', admin.id)
      .select('id, email, nombre')
      .single()
    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al actualizar perfil' },
      { status: 500 }
    )
  }
}
