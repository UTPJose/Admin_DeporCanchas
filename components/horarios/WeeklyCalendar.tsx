'use client'

import { ScheduleCell } from '@/components/horarios/ScheduleCell'

interface ScheduleBlock {
  id: number
  court_id: number
  start_date: string
  end_date: string
  reason?: string
  state: 'bloqueado' | 'reservado' | 'disponible'
}

interface WeeklyCalendarProps {
  weekStart: string
  schedules: ScheduleBlock[]
  onCellClick: (date: string, startTime: string, endTime: string) => void
}

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i) // 6am to 10pm
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function WeeklyCalendar({ weekStart, schedules, onCellClick }: WeeklyCalendarProps) {
  const getDayDate = (dayIndex: number) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + dayIndex)
    return date
  }

  const isScheduleInSlot = (dayDate: Date, hour: number, nextHour: number) => {
    return schedules.some((schedule) => {
      const scheduleStart = new Date(schedule.start_date)
      const scheduleEnd = new Date(schedule.end_date)
      const slotStart = new Date(dayDate)
      slotStart.setHours(hour, 0, 0, 0)
      const slotEnd = new Date(dayDate)
      slotEnd.setHours(nextHour, 0, 0, 0)

      return scheduleStart < slotEnd && scheduleEnd > slotStart
    })
}

  const handleCellClick = (dayDate: Date, hour: number) => {
    const dateStr = dayDate.toISOString().split('T')[0]
    const startTime = `${hour.toString().padStart(2, '0')}:00`
    const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
    onCellClick(dateStr, startTime, endTime)
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-max">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="w-20" /> {/* Time column */}
          {DAYS.map((day, dayIndex) => {
            const date = getDayDate(dayIndex)
            const dateStr = date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
            return (
              <div key={dayIndex} className="w-32 text-center">
                <div className="font-medium text-gray-900">{day}</div>
                <div className="text-sm text-gray-500">{dateStr}</div>
              </div>
            )
          })}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-8 gap-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
          {/* Time column */}
          <div className="w-20">
            {HOURS.map((hour) => (
              <div
                key={`time-${hour}`}
                className="h-16 border-b border-gray-200 flex items-center justify-end pr-2 text-xs text-gray-600"
              >
                {hour.toString().padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day columns */}
          {DAYS.map((_, dayIndex) => {
            const dayDate = getDayDate(dayIndex)
            return (
              <div key={`day-${dayIndex}`} className="w-32">
                {HOURS.map((hour) => {
                  const hasSchedule = isScheduleInSlot(dayDate, hour, hour + 1)
                  return (
                    <ScheduleCell
                      key={`cell-${dayIndex}-${hour}`}
                      hasSchedule={hasSchedule}
                      onClick={() => handleCellClick(dayDate, hour)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
