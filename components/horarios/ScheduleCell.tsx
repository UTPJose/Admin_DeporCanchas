'use client'

interface ScheduleCellProps {
  hasSchedule: boolean
  onClick: () => void
}

export function ScheduleCell({ hasSchedule, onClick }: ScheduleCellProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full h-16 border border-gray-200 transition-colors ${
        hasSchedule
          ? 'bg-red-100 hover:bg-red-200 cursor-not-allowed'
          : 'bg-white hover:bg-green-50 cursor-pointer'
      }`}
      disabled={hasSchedule}
      title={hasSchedule ? 'Slot ocupado' : 'Click para bloquear'}
    />
  )
}
