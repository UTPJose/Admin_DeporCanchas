import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import {
  requireSuperAdmin,
  UnauthorizedError,
  ForbiddenError,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/auth/requireAdmin'
import { hashPassword } from '@/lib/auth/password'

export const runtime = 'nodejs'

const patchSchema = z.object({
  nombre: z.string().trim().min(3).max(100).optional(),
  celular: z.string().regex(/^\d{9}$/).optional().or(z.literal('')),
  password: z.string().min(8).max(100).optional().or(z.literal('')),
  esta_activo: z.boolean().optional(),
})

// PATCH /api/admins/[id] — editar nombre/celular/clave o activar/desactivar
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  let admin
  try {
    admin = await requireSuperAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    if (e instanceof ForbiddenError) return forbiddenResponse()
    throw e
  }

  const { id } = await ctx.params
  const targetId = Number(id)
  if (!Number.isInteger(targetId)) {
    return Response.json({ success: false, error: 'id_invalido' }, { status: 400 })
  }

  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ success: false, error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
  }

  // Evitar que un admin se desactive a sí mismo
  if (admin.id === targetId && parsed.data.esta_activo === false) {
    return Response.json({ success: false, error: 'No puedes desactivar tu propia cuenta' }, { status: 400 })
  }

  const updates: Record<string, unknown> = { actualizado_en: new Date().toISOString() }
  if (parsed.data.nombre !== undefined) updates.nombre = parsed.data.nombre
  if (parsed.data.celular !== undefined) updates.celular = parsed.data.celular || null
  if (parsed.data.esta_activo !== undefined) updates.esta_activo = parsed.data.esta_activo
  if (parsed.data.password) updates.clave_hash = await hashPassword(parsed.data.password)

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .update(updates)
    .eq('id', targetId)
    .select('id, nombre, email, celular, esta_activo')
    .single()

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 })

  return Response.json({ success: true, data: { ...data, estado: data.esta_activo ? 'activo' : 'inactivo' } })
}
