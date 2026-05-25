'use client'

import { ScheduleCell } from '@/components/horarios/ScheduleCell'
import { addDaysYMD, ymdLabel, limaYMD, limaHour, limaMinutes } from '@/lib/lima-time'

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
  onEditBlock: (block: ScheduleBlock) => void
}

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i) // 6 AM a 10 PM
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function WeeklyCalendar({ weekStart, schedules, onCellClick, onUnblock, onEditBlock }: WeeklyCalendarProps) {
  // YMD (hora Lima) del día dayIndex (0 = lunes)
  const dayYMD = (dayIndex: number) => addDaysYMD(weekStart, dayIndex)

  const gridCells: React.ReactNode[] = []

  // --- Cabecera ---
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
    const ymd = dayYMD(dayIndex)
    gridCells.push(
      <div
        key={`header-day-${dayIndex}`}
        style={{ gridColumn: dayIndex + 2, gridRow: 1 }}
        className="h-12 bg-gray-50 border-b border-r last:border-r-0 border-gray-200 flex flex-col items-center justify-center p-1 text-center sticky top-0 z-20"
      >
        <span className="font-semibold text-xs text-gray-900">{day}</span>
        <span className="text-[10px] text-gray-500">{ymdLabel(ymd)}</span>
      </div>
    )
  })

  // --- Etiquetas de hora ---
  HOURS.forEach((hour) => {
    const row = hour - 4
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

  // --- Bloques + slots libres ---
  DAYS.forEach((_, dayIndex) => {
    const ymd = dayYMD(dayIndex)

    // Bloques cuyo día (en hora Lima) coincide con esta columna
    const daySchedules = schedules.filter((s) => limaYMD(s.start_date) === ymd)

    const occupiedHours = new Set<number>()

    daySchedules.forEach((schedule) => {
      const startHourRaw = limaHour(schedule.start_date)
      const endH = limaHour(schedule.end_date)
      const endMin = limaMinutes(schedule.end_date)
      // fin redondeado hacia arriba; si el fin cae en otro día, tope 23
      let endHourRaw = endMin > 0 ? endH + 1 : endH
      if (limaYMD(schedule.end_date) !== ymd) endHourRaw = 23

      const startHour = Math.max(6, Math.min(22, startHourRaw))
      const endHour = Math.max(6, Math.min(23, endHourRaw))
      if (startHour >= endHour) return

      const startRow = startHour - 4
      const endRow = endHour - 4
      const col = dayIndex + 2

      for (let h = startHour; h < endHour; h++) occupiedHours.add(h)

      gridCells.push(
        <div
          key={`schedule-${schedule.id}-${dayIndex}`}
          style={{ gridColumn: col, gridRow: `${startRow} / ${endRow}` }}
          className="h-full w-full"
        >
          <ScheduleCell
            schedule={schedule}
            onClick={() => {
              if (schedule.state === 'bloqueada') onEditBlock(schedule)
            }}
            onUnblock={onUnblock}
          />
        </div>
      )
    })

    HOURS.forEach((hour) => {
      if (occupiedHours.has(hour)) return
      const row = hour - 4
      const col = dayIndex + 2
      gridCells.push(
        <div
          key={`slot-free-${dayIndex}-${hour}`}
          style={{ gridColumn: col, gridRow: row }}
          className="h-full w-full"
        >
          <ScheduleCell
            onClick={() =>
              onCellClick(
                ymd,
                `${hour.toString().padStart(2, '0')}:00`,
                `${(hour + 1).toString().padStart(2, '0')}:00`
              )
            }
            onUnblock={() => {}}
          />
        </div>
      )
    })
  })

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <div className="min-w-[800px] bg-white">
        <div className="grid grid-cols-[80px_repeat(7,_1fr)] grid-rows-[48px_repeat(17,_64px)] relative">
          {gridCells}
        </div>
      </div>
    </div>
  )
}
