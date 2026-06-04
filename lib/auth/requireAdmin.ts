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
  /** true si es el super-admin (único que puede crear/modificar otros admins). */
  isSuper: boolean
}

/** Email del super-admin. Se lee del env; cae al admin sembrado por defecto. */
export const SUPER_ADMIN_EMAIL =
  (process.env.SUPER_ADMIN_EMAIL ?? 'admin@deporcanchas.com').toLowerCase()

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
    isSuper: (data.email || '').toLowerCase() === SUPER_ADMIN_EMAIL,
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const admin = await getCurrentAdmin()
  if (!admin) throw new UnauthorizedError()
  return admin
}

export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden')
    this.name = 'ForbiddenError'
  }
}

/** Solo el super-admin pasa. Lanza ForbiddenError si es admin "regular". */
export async function requireSuperAdmin(): Promise<AdminUser> {
  const admin = await requireAdmin()
  if (!admin.isSuper) throw new ForbiddenError()
  return admin
}

export function unauthorizedResponse(): Response {
  return Response.json({ success: false, error: 'unauthorized' }, { status: 401 })
}

export function forbiddenResponse(): Response {
  return Response.json(
    { success: false, error: 'Solo el super-administrador puede realizar esta acción.' },
    { status: 403 }
  )
}
