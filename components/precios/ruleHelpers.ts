export interface PricingRule {
  id: number
  nombre: string
  dias?: number[] | null
  hora_empieza?: string | null
  hora_termina?: string | null
  fecha_empieza?: string | null
  fecha_termina?: string | null
  precio: number
  prioridad: number
}

/** Tipos de regla que ofrece la UI. */
export type RuleType = 'dias' | 'dias_horas' | 'fechas' | 'general'

/** Días de la semana en orden de UI (n = convención getDay/Lima: 0=Dom..6=Sáb). */
export const DOW: { n: number; l: string }[] = [
  { n: 1, l: 'Lun' },
  { n: 2, l: 'Mar' },
  { n: 3, l: 'Mié' },
  { n: 4, l: 'Jue' },
  { n: 5, l: 'Vie' },
  { n: 6, l: 'Sáb' },
  { n: 0, l: 'Dom' },
]

export function dowLabel(n: number): string {
  return DOW.find((d) => d.n === n)?.l ?? String(n)
}

/** Deriva el tipo de regla a partir de sus campos. */
export function ruleType(r: PricingRule): RuleType {
  const tieneDias = !!r.dias && r.dias.length > 0
  const tieneHora = !!r.hora_empieza && !!r.hora_termina
  const tieneFecha = !!r.fecha_empieza && !!r.fecha_termina
  if (tieneDias && tieneHora) return 'dias_horas'
  if (tieneDias) return 'dias'
  if (tieneFecha) return 'fechas'
  return 'general'
}

export const RULE_TYPE_LABEL: Record<RuleType, string> = {
  dias: 'Días de la semana',
  dias_horas: 'Días + Horas',
  fechas: 'Rango de fechas',
  general: 'General',
}

export function hourLabel(r: PricingRule): string | null {
  if (!r.hora_empieza || !r.hora_termina) return null
  return `${r.hora_empieza.slice(0, 5)} - ${r.hora_termina.slice(0, 5)}`
}

export function dateLabel(r: PricingRule): string | null {
  if (!r.fecha_empieza || !r.fecha_termina) return null
  return `${r.fecha_empieza} - ${r.fecha_termina}`
}
