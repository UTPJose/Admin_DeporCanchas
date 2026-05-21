'use client'

import { Lock, Calendar } from 'lucide-react'

interface ScheduleBlock {
  id: number
  court_id: number
  start_date: string
  end_date: string
  reason?: string
  state: 'bloqueada' | 'reservado' | 'disponible'
  code?: string | null
  user_email?: string
  real_state?: string
}

interface ScheduleCellProps {
  schedule?: ScheduleBlock
  onClick: () => void
  onUnblock: (id: number) => void
}

function formatTimeRange(startStr: string, endStr: string): string {
  try {
    const start = new Date(startStr)
    const end = new Date(endStr)
    
    const startHours = start.getUTCHours().toString().padStart(2, '0')
    const startMinutes = start.getUTCMinutes().toString().padStart(2, '0')
    const endHours = end.getUTCHours().toString().padStart(2, '0')
    const endMinutes = end.getUTCMinutes().toString().padStart(2, '0')
    
    return `(${startHours}:${startMinutes} - ${endHours}:${endMinutes})`
  } catch (e) {
    return ''
  }
}

export function ScheduleCell({ schedule, onClick, onUnblock }: ScheduleCellProps) {
  if (schedule) {
    const timeRange = formatTimeRange(schedule.start_date, schedule.end_date)

    if (schedule.state === 'bloqueada') {
      return (
        <div className="h-full w-full p-2 border-b border-r border-gray-200 bg-amber-50/90 border-l-4 border-l-amber-500 flex flex-col justify-start gap-0.5 text-left group relative min-h-[64px] hover:bg-amber-100/40 transition-colors select-none">
          <div className="flex items-center justify-between w-full gap-1">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-0.5 shrink-0">
              <Lock className="w-3 h-3 text-amber-600 animate-pulse shrink-0" />
              Bloqueada
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onUnblock(schedule.id)
              }}
              className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[9px] font-bold transition-opacity duration-150 cursor-pointer shrink-0"
              title="Desbloquear horario"
            >
              Liberar
            </button>
          </div>
          <span className="text-[9px] font-semibold text-amber-600">
            {timeRange}
          </span>
          <div className="text-[10px] text-amber-900 leading-tight font-medium line-clamp-2 pr-1" title={schedule.reason}>
            {schedule.reason || 'Bloqueo Manual'}
          </div>
        </div>
      )
    }

    // Configuración visual según el estado real de la reserva
    const state = schedule.real_state || 'reservado'
    
    let cardStyles = {
      bg: 'bg-green-50/80 border-l-green-600 hover:bg-green-100/30',
      badgeText: 'text-green-800',
      iconColor: 'text-green-700',
      timeText: 'text-green-700',
      descText: 'text-green-950',
      badgeBg: 'bg-green-100 text-green-800',
      label: 'Reservada',
      desc: 'Reserva Pagada'
    }

    if (state === 'pendiente') {
      cardStyles = {
        bg: 'bg-amber-50/50 border-l-amber-500 hover:bg-amber-100/30 border-l-4',
        badgeText: 'text-amber-800',
        iconColor: 'text-amber-600',
        timeText: 'text-amber-700',
        descText: 'text-amber-950',
        badgeBg: 'bg-amber-100 text-amber-800',
        label: 'Pendiente',
        desc: 'Reserva Pendiente'
      }
    } else if (state === 'pagada') {
      cardStyles = {
        bg: 'bg-green-50/80 border-l-green-600 hover:bg-green-100/30 border-l-4',
        badgeText: 'text-green-800',
        iconColor: 'text-green-700',
        timeText: 'text-green-700',
        descText: 'text-green-950',
        badgeBg: 'bg-green-100 text-green-800',
        label: 'Pagada',
        desc: 'Reserva Pagada'
      }
    } else if (state === 'expirada') {
      cardStyles = {
        bg: 'bg-gray-50/70 border-l-gray-400 hover:bg-gray-100/30 border-l-4',
        badgeText: 'text-gray-700',
        iconColor: 'text-gray-500',
        timeText: 'text-gray-600',
        descText: 'text-gray-800',
        badgeBg: 'bg-gray-200 text-gray-750',
        label: 'Expirada',
        desc: 'Reserva Expirada'
      }
    } else {
      // Fallback
      const labelName = state.charAt(0).toUpperCase() + state.slice(1)
      cardStyles = {
        bg: 'bg-green-50/80 border-l-green-600 hover:bg-green-100/30 border-l-4',
        badgeText: 'text-green-800',
        iconColor: 'text-green-700',
        timeText: 'text-green-700',
        descText: 'text-green-950',
        badgeBg: 'bg-green-100 text-green-800',
        label: labelName,
        desc: `Reserva ${labelName}`
      }
    }

    // Si es reservado / ocupado por cliente
    return (
      <div className={`h-full w-full p-2 border-b border-r border-gray-200 ${cardStyles.bg} flex flex-col justify-start gap-0.5 text-left min-h-[64px] transition-colors select-none`}>
        <div className="flex items-center justify-between w-full gap-1">
          <span className={`text-[10px] font-bold ${cardStyles.badgeText} uppercase tracking-wider flex items-center gap-0.5 shrink-0`}>
            <Calendar className={`w-3 h-3 ${cardStyles.iconColor} shrink-0`} />
            {cardStyles.label}
          </span>
          {schedule.code && (
            <span className={`text-[9px] font-mono ${cardStyles.badgeBg} px-1 py-0.5 rounded-sm font-bold shrink-0`}>
              {schedule.code}
            </span>
          )}
        </div>
        <span className={`text-[9px] font-semibold ${cardStyles.timeText}`}>
          {timeRange}
        </span>
        <div className={`text-[10px] ${cardStyles.descText} font-bold leading-tight line-clamp-2`} title={cardStyles.desc}>
          {cardStyles.desc}
        </div>
      </div>
    )
  }

  // Disponible para bloqueo
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-16 w-full border-b border-r border-gray-200 bg-white hover:bg-green-50/30 transition-colors flex items-center justify-center group cursor-pointer"
      title="Click para bloquear"
    >
      <span className="text-xs text-gray-400 group-hover:text-green-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        + Bloquear
      </span>
    </button>
  )
}


