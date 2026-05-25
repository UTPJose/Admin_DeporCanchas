import 'server-only'
import { getSessionFromCookies } from './session'
import { supabaseAdmin } from '@/lib/supabase'

export type AdminUser = {
  id: number
  email: string
  nombre: string
  celular: string | null
  dni: string | null
  roles_id: number
  rol_nombre: string
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}

/** Un rol cuenta como admin si su nombre contiene "admin" (cubre `admin` y `ROLE_ADMIN`). */
export function isAdminRole(nombre: string | null | undefined): boolean {
  return !!nombre && nombre.toLowerCase().includes('admin')
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const session = await getSessionFromCookies()
  if (!session) return null

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, email, nombre, celular, dni, roles_id, esta_activo, roles ( nombre )')
    .eq('id', session.uid)
    .single()

  if (error || !data || !data.esta_activo) return null

  const rol = data.roles as { nombre: string } | { nombre: string }[] | null
  const rol_nombre = Array.isArray(rol) ? rol[0]?.nombre ?? '' : rol?.nombre ?? ''
  if (!isAdminRole(rol_nombre)) return null

  return {
    id: data.id,
    email: data.email,
    nombre: data.nombre,
    celular: data.celular,
    dni: data.dni,
    roles_id: data.roles_id,
    rol_nombre,
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new UnauthorizedError()
  return admin
}

export function unauthorizedResponse(): Response {
  return Response.json({ success: false, error: 'unauthorized' }, { status: 401 })
}
