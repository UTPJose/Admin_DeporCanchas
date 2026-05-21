'use client'

import { ScheduleCell } from '@/components/horarios/ScheduleCell'

interface ScheduleBlock {
  id: number
  court_id: number
  start_date: string
  end_date: string
  reason?: string
  state: 'bloqueada' | 'reservado' | 'disponible'
  code?: string | null
  user_email?: string
}

interface WeeklyCalendarProps {
  weekStart: string
  schedules: ScheduleBlock[]
  onCellClick: (date: string, startTime: string, endTime: string) => void
  onUnblock: (id: number) => void
}

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i) // 6 AM a 10 PM
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function WeeklyCalendar({ weekStart, schedules, onCellClick, onUnblock }: WeeklyCalendarProps) {
  
  // Obtiene la fecha exacta de un día de la semana en UTC para evitar desfases horarios del navegador
  const getDayDate = (dayIndex: number) => {
    const [year, month, day] = weekStart.split('-').map(Number)
    const date = new Date(Date.UTC(year, month - 1, day))
    date.setUTCDate(date.getUTCDate() + dayIndex)
    return date
  }

  const handleCellClick = (dayDate: Date, hour: number) => {
    // Formatea la fecha local del slot
    const dateStr = dayDate.toISOString().split('T')[0]
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
    onCellClick(dateStr, startTime, endTime)
  }

  // Lista plana de nodos React que se posicionarán mediante coordenadas de CSS Grid
  const gridCells: React.ReactNode[] = []

  // --- 1. Cabecera (Fila 1) ---
  gridCells.push(
    <div 
      key="header-corner" 
      style={{ gridColumn: 1, gridRow: 1 }}
      className="h-12 bg-gray-50 border-b border-r border-gray-200 flex items-center justify-center text-xs font-semibold text-gray-500 uppercase select-none sticky top-0 z-20"
    >
      Hora
    </div>
  )

  DAYS.forEach((day, dayIndex) => {
    const date = getDayDate(dayIndex)
    const dateStr = date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric',
      timeZone: 'UTC' 
    })
    
    gridCells.push(
      <div 
        key={`header-day-${dayIndex}`} 
        style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
        className="h-12 bg-gray-50 border-b border-r last:border-r-0 border-gray-200 flex flex-col items-center justify-center p-1 text-center sticky top-0 z-20"
      >
        <span className="font-semibold text-xs text-gray-900">{day}</span>
        <span className="text-[10px] text-gray-500">{dateStr}</span>
      </div>
    )
  })

  // --- 2. Etiquetas de Hora (Columna 1, Filas 2 a 18) ---
  HOURS.forEach((hour) => {
    const row = hour - 4 // hour=6 -> row=2
    gridCells.push(
      <div 
        key={`label-hour-${hour}`}
        style={{ gridColumn: 1, gridRow: row }}
        className="h-16 bg-gray-50 border-b border-r border-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium select-none"
      >
        {hour.toString().padStart(2, '0')}:00
      </div>
    )
  })

  // --- 3. Posicionar Bloques (Ocupados/Reservados) y Slots Libres ---
  DAYS.forEach((_, dayIndex) => {
    const dayDate = getDayDate(dayIndex)
    const dayStart = new Date(dayDate)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(dayDate)
    dayEnd.setUTCHours(23, 59, 59, 999)

    // Filtrar los bloques pertenecientes a este día
    const daySchedules = schedules.filter((schedule) => {
      const sStart = new Date(schedule.start_date)
      const sEnd = new Date(schedule.end_date)
      return sStart <= dayEnd && sEnd >= dayStart
    })

    const occupiedHours = new Set<number>()

    // Renderizar bloques ocupados con tamaño dinámico (span de filas)
    daySchedules.forEach((schedule) => {
      const sStart = new Date(schedule.start_date)
      const sEnd = new Date(schedule.end_date)

      // Limitar la hora de inicio y fin en el rango [6, 23] para este día
      let startHour = sStart.getUTCFullYear() < dayDate.getUTCFullYear() || 
                       sStart.getUTCMonth() < dayDate.getUTCMonth() ||
                       sStart.getUTCDate() < dayDate.getUTCDate() 
                       ? 6 
                       : sStart.getUTCHours()

      let endHour = sEnd.getUTCFullYear() > dayDate.getUTCFullYear() || 
                     sEnd.getUTCMonth() > dayDate.getUTCMonth() ||
                     sEnd.getUTCDate() > dayDate.getUTCDate() 
                     ? 23 
                     : Math.ceil(sEnd.getUTCHours() + sEnd.getUTCMinutes() / 60)

      // Acotar a los límites visibles del calendario (6 AM a 10 PM / 11 PM fin)
      startHour = Math.max(6, Math.min(22, startHour))
      endHour = Math.max(6, Math.min(23, endHour))

      if (startHour >= endHour) return // Evitar rangos de tiempo vacíos

      const startRow = startHour - 4 // hour=6 -> row=2
      const endRow = endHour - 4     // hour=23 -> row=19

      const col = dayIndex + 2 // Mon=2, Sun=8

      // Registrar horas del bloque para evitar colisiones
      for (let h = startHour; h < endHour; h++) {
        occupiedHours.add(h)
      }

      gridCells.push(
        <div
          key={`schedule-${schedule.id}-${dayIndex}`}
          style={{ 
            gridColumn: col, 
            gridRow: `${startRow} / ${endRow}` 
          }}
          className="h-full w-full"
        >
          <ScheduleCell
            schedule={schedule}
            onClick={() => {}}
            onUnblock={onUnblock}
          />
        </div>
      )
    })

    // Rellenar horas desocupadas con celdas de "+ Bloquear" individuales
    HOURS.forEach((hour) => {
      if (occupiedHours.has(hour)) return // Saltarse si ya está cubierto por un bloque

      const row = hour - 4
      const col = dayIndex + 2

      gridCells.push(
        <div
          key={`slot-free-${dayIndex}-${hour}`}
          style={{ 
            gridColumn: col, 
            gridRow: row 
          }}
          className="h-full w-full"
        >
          <ScheduleCell
            onClick={() => handleCellClick(dayDate, hour)}
            onUnblock={() => {}}
          />
        </div>
      )
    })
  })

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <div className="min-w-[800px] bg-white">
        
        {/* Contenedor Grid Principal con dimensiones y proporciones exactas */}
        <div className="grid grid-cols-[80px_repeat(7,_1fr)] grid-rows-[48px_repeat(17,_64px)] relative">
          {gridCells}
        </div>
        
      </div>
    </div>
  )
}
