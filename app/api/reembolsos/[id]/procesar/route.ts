import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { requireAdmin, UnauthorizedError, unauthorizedResponse } from '@/lib/auth/requireAdmin'
import { sendReembolsoProcesado } from '@/lib/email/sendReembolsoProcesado'

export const runtime = 'nodejs'

/**
 * POST /api/reembolsos/[id]/procesar - Marca un reembolso como `procesado` y
 * notifica al cliente por correo. Body opcional: `{ nota?: string }` — la nota
 * (ej. "Transferencia realizada el 01/07 vía BCP") se incluye en el email.
 * Si el envío del correo falla, el estado igual queda persistido.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
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

  let nota: string | undefined
  try {
    const body = await req.json()
    const raw = typeof body?.nota === 'string' ? body.nota.trim() : ''
    if (raw) nota = raw.slice(0, 400)
  } catch {
    // body vacío: OK
  }

  try {
    const { data: refund, error } = await supabaseAdmin
      .from('reembolsos')
      .update({ estado: 'procesado', procesado_en: new Date().toISOString() })
      .eq('id', refundId)
      .select('id, reserva_id, monto, porcentaje, destino_detalle, metodo_destino')
      .single()
    if (error || !refund) {
      return NextResponse.json({ success: false, error: error?.message ?? 'no encontrado' }, { status: 500 })
    }

    try {
      const { data: reserva } = await supabaseAdmin
        .from('reservas')
        .select('fecha_empieza, usuarios_id, canchasdep_id')
        .eq('id', refund.reserva_id)
        .single()

      if (reserva) {
        const [{ data: usuario }, { data: cancha }] = await Promise.all([
          supabaseAdmin.from('usuarios').select('nombre, email').eq('id', reserva.usuarios_id).single(),
          supabaseAdmin.from('canchas_deportivas').select('nombre, campus_id').eq('id', reserva.canchasdep_id).single(),
        ])
        const campusRes = cancha
          ? await supabaseAdmin.from('campus').select('nombre').eq('id', cancha.campus_id).single()
          : null
        const campus = campusRes?.data ?? null

        if (usuario?.email) {
          const dt = new Date(reserva.fecha_empieza)
          const fecha = new Intl.DateTimeFormat('es-PE', {
            timeZone: 'America/Lima',
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          }).format(dt)
          const hora = new Intl.DateTimeFormat('es-PE', {
            timeZone: 'America/Lima',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          }).format(dt)

          const destino =
            refund.metodo_destino === 'tarjeta'
              ? `Tarjeta ${refund.destino_detalle ?? ''}`.trim()
              : refund.metodo_destino === 'yape'
                ? `Yape al ${refund.destino_detalle ?? '—'}`
                : (refund.destino_detalle ?? '—')

          await sendReembolsoProcesado({
            to: usuario.email,
            cliente: usuario.nombre ?? 'Cliente',
            monto: Number(refund.monto),
            porcentaje: refund.porcentaje as 50 | 100,
            destino,
            campus: campus?.nombre ?? '—',
            cancha: cancha?.nombre ?? '—',
            fecha,
            hora,
            nota,
          })
        }
      }
    } catch (mailErr) {
      console.error(
        '[reembolsos/procesar] email falló (estado sí quedó procesado):',
        mailErr instanceof Error ? mailErr.message : mailErr,
      )
    }

    return NextResponse.json({ success: true, data: refund })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al procesar reembolso' },
      { status: 500 }
    )
  }
}
