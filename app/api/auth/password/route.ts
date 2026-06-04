import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

/**
 * PUT /api/auth/password - Cambia la contraseña del admin logueado.
 * EXIGE la contraseña actual y verifica contra el hash en BD antes de aceptar
 * la nueva (defensa contra cambios no autorizados aunque el usuario haya
 * dejado la sesión abierta — punto 14).
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
    const currentPassword: string = (body.currentPassword ?? '').toString()
    const newPassword: string = (body.newPassword ?? '').toString()

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, error: 'Falta la contraseña actual.' },
        { status: 400 }
      )
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      )
    }

    // Obtener hash actual del admin
    const { data: row, error: getErr } = await supabaseAdmin
      .from('usuarios')
      .select('clave_hash')
      .eq('id', admin.id)
      .single()
    if (getErr || !row) {
      return NextResponse.json(
        { success: false, error: 'No se pudo verificar la cuenta.' },
        { status: 500 }
      )
    }

    const ok = await verifyPassword(currentPassword, row.clave_hash)
    if (!ok) {
      return NextResponse.json(
        { success: false, error: 'La contraseña actual es incorrecta.' },
        { status: 401 }
      )
    }

    const newHash = await hashPassword(newPassword)
    const { error: updErr } = await supabaseAdmin
      .from('usuarios')
      .update({ clave_hash: newHash })
      .eq('id', admin.id)
    if (updErr) {
      return NextResponse.json(
        { success: false, error: updErr.message },
        { status: 500 }
      )
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al cambiar contraseña' },
      { status: 500 }
    )
  }
}
