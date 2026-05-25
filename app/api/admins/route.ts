import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'
import { hashPassword } from '@/lib/auth/password'

export const runtime = 'nodejs'

const createSchema = z.object({
  nombre: z.string().trim().min(3).max(100),
  email: z.string().trim().toLowerCase().email(),
  celular: z.string().regex(/^\d{9}$/).optional().or(z.literal('')),
  password: z.string().min(8).max(100),
})

/** Resuelve el roles_id del rol admin (prefiere 'admin'; cae a cualquiera con "admin" en el nombre). */
async function getAdminRoleId(): Promise<number | null> {
  const { data } = await supabaseAdmin.from('roles').select('id, nombre')
  if (!data) return null
  const exact = data.find((r) => r.nombre.toLowerCase() === 'admin')
  if (exact) return exact.id
  const like = data.find((r) => r.nombre.toLowerCase().includes('admin'))
  return like?.id ?? null
}

// GET /api/admins — lista de administradores
export async function GET() {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, email, celular, esta_activo, roles ( nombre )')
    .order('id', { ascending: true })

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 })

  const admins = (data ?? [])
    .filter((u) => {
      const rol = u.roles as { nombre: string } | { nombre: string }[] | null
      const nombre = Array.isArray(rol) ? rol[0]?.nombre : rol?.nombre
      return !!nombre && nombre.toLowerCase().includes('admin')
    })
    .map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      celular: u.celular,
      estado: u.esta_activo ? 'activo' : 'inactivo',
    }))

  return Response.json({ success: true, data: admins })
}

// POST /api/admins — crear nuevo admin
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ success: false, error: 'Datos inválidos', issues: parsed.error.issues }, { status: 400 })
  }
  const { nombre, email, celular, password } = parsed.data

  const roleId = await getAdminRoleId()
  if (!roleId) return Response.json({ success: false, error: 'No existe rol admin' }, { status: 500 })

  const { data: dup } = await supabaseAdmin.from('usuarios').select('id').eq('email', email).maybeSingle()
  if (dup) return Response.json({ success: false, error: 'Ya existe un usuario con ese email' }, { status: 409 })

  const clave_hash = await hashPassword(password)
  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .insert({ nombre, email, celular: celular || null, clave_hash, roles_id: roleId, esta_activo: true })
    .select('id, nombre, email, celular, esta_activo')
    .single()

  if (error) return Response.json({ success: false, error: error.message }, { status: 500 })

  return Response.json({ success: true, data: { ...data, estado: 'activo' } }, { status: 201 })
}
