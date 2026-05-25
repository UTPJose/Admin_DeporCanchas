import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword } from '@/lib/auth/password'
import { signSession, setSessionCookie } from '@/lib/auth/session'
import { isAdminRole } from '@/lib/auth/requireAdmin'

export const runtime = 'nodejs'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
})

// Rate limit en memoria (5/min por IP)
const attempts = new Map<string, { count: number; resetAt: number }>()
function rateLimit(ip: string): boolean {
  const now = Date.now()
  const e = attempts.get(ip)
  if (!e || e.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + 60_000 })
    return true
  }
  if (e.count >= 5) return false
  e.count += 1
  return true
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
  if (!rateLimit(ip)) {
    return Response.json({ success: false, error: 'too_many_attempts' }, { status: 429 })
  }

  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ success: false, error: 'Email y contraseña requeridos' }, { status: 400 })
  }
  const { email, password } = parsed.data

  const { data: user } = await supabaseAdmin
    .from('usuarios')
    .select('id, email, nombre, roles_id, clave_hash, esta_activo, roles ( nombre )')
    .eq('email', email)
    .maybeSingle()

  if (!user || !user.esta_activo) {
    return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 })
  }

  const ok = await verifyPassword(password, user.clave_hash)
  if (!ok) {
    return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 })
  }

  const rol = user.roles as { nombre: string } | { nombre: string }[] | null
  const rolNombre = Array.isArray(rol) ? rol[0]?.nombre ?? '' : rol?.nombre ?? ''
  if (!isAdminRole(rolNombre)) {
    return Response.json({ success: false, error: 'No autorizado: se requiere rol de administrador' }, { status: 403 })
  }

  const token = await signSession({ uid: user.id, rid: user.roles_id })
  await setSessionCookie(token)

  return Response.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, nombre: user.nombre, roles_id: user.roles_id, rol_nombre: rolNombre },
    },
  })
}
