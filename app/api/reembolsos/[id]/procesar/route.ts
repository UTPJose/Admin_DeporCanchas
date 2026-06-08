import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'

/**
 * POST /api/reembolsos/[id]/procesar - Marca un reembolso como `procesado`.
 * El admin lo dispara cuando ya realizó la devolución por fuera del sistema
 * (Yape, transferencia, voucher de tarjeta, etc.). Idempotente: si ya estaba
 * procesado, devuelve el mismo estado sin error.
 */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const { id } = await ctx.params
  const refundId = parseInt(id, 10)
  if (!Number.isInteger(refundId)) {
    return NextResponse.json({ success: false, error: 'id inválido' }, { status: 400 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('reembolsos')
      .update({ estado: 'procesado', procesado_en: new Date().toISOString() })
      .eq('id', refundId)
      .select()
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al procesar reembolso' },
      { status: 500 }
    )
  }
}
