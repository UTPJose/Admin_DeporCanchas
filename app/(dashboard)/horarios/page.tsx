'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ControlBar } from '@/components/horarios/ControlBar'
import { WeeklyCalendar } from '@/components/horarios/WeeklyCalendar'
import { BlockModal } from '@/components/horarios/BlockModal'
import { useState as useStateCallback } from 'react'

interface Court {
  id: number
  nombre: string
  campus_id: number
}

interface Campus {
  id: number
  nombre: string
}

interface ScheduleBlock {
  id: number
  court_id: number
  start_date: string
  end_date: string
  reason?: string
  state: 'bloqueado' | 'reservado' | 'disponible'
}

export default function HorariosPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [weekStart, setWeekStart] = useState<string>(getWeekStart(new Date()))
  const [weekEnd, setWeekEnd] = useState<string>(getWeekEnd(new Date()))
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null)

  useEffect(() => {
    fetchCampuses()
  }, [])

  useEffect(() => {
    if (selectedCampus) {
      fetchCourts(selectedCampus)
    }
  }, [selectedCampus])

  useEffect(() => {
    if (selectedCourt) {
      fetchSchedules()
    }
  }, [selectedCourt, weekStart, weekEnd])

  const fetchCampuses = async () => {
    try {
      const response = await fetch('/api/campus')
      const result = await response.json()
      if (result.success) {
        setCampuses(result.data)
        if (result.data.length > 0) {
          setSelectedCampus(result.data[0].id)
        }
      }
    } catch (err) {
      setError('Error al cargar campus')
    }
  }

  const fetchCourts = async (campusId: number) => {
    try {
      const response = await fetch(`/api/courts?campus_id=${campusId}`)
      const result = await response.json()
      if (result.success) {
        setCourts(result.data)
        if (result.data.length > 0) {
          setSelectedCourt(result.data[0].id)
        }
      }
    } catch (err) {
      setError('Error al cargar canchas')
    }
  }

  const fetchSchedules = async () => {
    if (!selectedCourt) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/schedules?action=blocked&court_id=${selectedCourt}&week_start=${weekStart}&week_end=${weekEnd}`
      )
      const result = await response.json()
      if (result.success) {
        setSchedules(result.data || [])
      }
    } catch (err) {
      setError('Error al cargar horarios')
    } finally {
      setLoading(false)
    }
  }

  const handlePrevWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() - 7)
    setWeekStart(getWeekStart(newDate))
    setWeekEnd(getWeekEnd(newDate))
  }

  const handleNextWeek = () => {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + 7)
    setWeekStart(getWeekStart(newDate))
    setWeekEnd(getWeekEnd(newDate))
  }

  const handleCellClick = (date: string, startTime: string, endTime: string) => {
    setSelectedSlot({ date, startTime, endTime })
    setShowBlockModal(true)
  }

  const handleBlockSaved = () => {
    setShowBlockModal(false)
    fetchSchedules()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Horarios y Calendarios</h1>
      </div>

      <Card>
        <div className="space-y-6">
          <ControlBar
            selectedCampus={selectedCampus}
            selectedCourt={selectedCourt}
            weekStart={weekStart}
            weekEnd={weekEnd}
            campuses={campuses}
            courts={courts}
            onCampusChange={setSelectedCampus}
            onCourtChange={setSelectedCourt}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
          />

          {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : (
            <WeeklyCalendar
              weekStart={weekStart}
              schedules={schedules}
              onCellClick={handleCellClick}
            />
          )}
        </div>
      </Card>

      {showBlockModal && selectedSlot && (
        <BlockModal
          courtId={selectedCourt!}
          initialDate={selectedSlot.date}
          initialStartTime={selectedSlot.startTime}
          initialEndTime={selectedSlot.endTime}
          onClose={() => setShowBlockModal(false)}
          onSave={handleBlockSaved}
        />
      )}
    </div>
  )
}

function getWeekStart(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + 1)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay() + 7)
  return d.toISOString().split('T')[0]
}
