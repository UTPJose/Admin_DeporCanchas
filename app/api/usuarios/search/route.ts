import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * GET /api/usuarios/search?q=<texto>&limit=<n>
 *
 * Búsqueda case-insensitive de clientes por nombre o email. Pensada para
 * usarse como autocomplete (debounce 250 ms en el cliente). Devuelve hasta
 * `limit` matches (default 10, máx 20). Sólo clientes (rol_id ≠ admin).
 *
 * - q vacío o < 2 chars → `[]` para evitar listar todo.
 * - Activos primero; ordenados por nombre.
 */
export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') ?? '').trim()
  const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)))

  if (q.length < 2) {
    return NextResponse.json({ success: true, data: [] })
  }

  // Escapamos `%`, `_` y `,` que tienen significado especial en ilike.or()
  const safe = q.replace(/[%_,]/g, (m) => `\\${m}`)
  const pattern = `%${safe}%`

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select('id, nombre, email, esta_activo')
    .or(`nombre.ilike.${pattern},email.ilike.${pattern}`)
    .order('esta_activo', { ascending: false })
    .order('nombre', { ascending: true })
    .limit(limit)

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: data ?? [] })
}
