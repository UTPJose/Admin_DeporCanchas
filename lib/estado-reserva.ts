/**
 * Estado mostrado de una reserva, derivado del estado real en BD + la fecha.
 * BD real: pendiente | pagada | cancelada | expirada (no se agregan estados).
 *
 *   pagada + fecha_termina < ahora  → finalizada
 *   pagada + futuro                 → programada
 *   pendiente                       → pendiente (de pago)
 *   cancelada                       → cancelada
 *   expirada                        → expirada
 */

export type EstadoReal = 'pendiente' | 'pagada' | 'cancelada' | 'expirada'
export type EstadoMostrado = 'programada' | 'finalizada' | 'pendiente' | 'cancelada' | 'expirada'

export function estadoMostrado(estado: string, fechaTermina: string | Date): EstadoMostrado {
  const e = (estado || '').toLowerCase()
  if (e === 'pagada') {
    const fin = typeof fechaTermina === 'string' ? new Date(fechaTermina) : fechaTermina
    return fin.getTime() < Date.now() ? 'finalizada' : 'programada'
  }
  if (e === 'pendiente') return 'pendiente'
  if (e === 'cancelada') return 'cancelada'
  return 'expirada'
}

export const ESTADO_MOSTRADO_LABEL: Record<EstadoMostrado, string> = {
  programada: 'Programada',
  finalizada: 'Finalizada',
  pendiente: 'Pendiente de pago',
  cancelada: 'Cancelada',
  expirada: 'Expirada',
}

/** Filtros del listado de reservaciones del admin. */
export type FiltroReserva = 'todas' | 'programadas' | 'finalizadas' | 'pendientes' | 'canceladas' | 'expiradas'

export const FILTRO_LABEL: Record<FiltroReserva, string> = {
  todas: 'Todas',
  programadas: 'Programadas',
  finalizadas: 'Finalizadas',
  pendientes: 'Pendientes',
  canceladas: 'Canceladas',
  expiradas: 'Expiradas',
}

/** ¿La reserva (estado real + fecha) cae dentro del filtro elegido? */
export function pasaFiltro(filtro: FiltroReserva, estado: string, fechaTermina: string | Date): boolean {
  if (filtro === 'todas') return true
  const m = estadoMostrado(estado, fechaTermina)
  switch (filtro) {
    case 'programadas': return m === 'programada'
    case 'finalizadas': return m === 'finalizada'
    case 'pendientes': return m === 'pendiente'
    case 'canceladas': return m === 'cancelada'
    case 'expiradas': return m === 'expirada'
    default: return true
  }
}
