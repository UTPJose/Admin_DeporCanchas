'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ControlBar } from '@/components/horarios/ControlBar'
import { WeeklyCalendar } from '@/components/horarios/WeeklyCalendar'
import { BlockModal } from '@/components/horarios/BlockModal'
import { ReservationDetailModal, type CalendarReservation } from '@/components/horarios/ReservationDetailModal'
import { ConfirmModal } from '@/components/common/ConfirmModal'
import { weekStartYMD, addDaysYMD, limaYMD, limaHour, limaMinutes } from '@/lib/lima-time'
import type { ClientSearchValue } from '@/components/common/ClientSearchInput'

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
  state: 'bloqueada' | 'reservado' | 'disponible'
  user_email?: string
  user_nombre?: string
  usuarios_id?: number | null
  precio_total?: number | null
  code?: string | null
  estado_db?: 'pendiente' | 'pagada' | 'cancelada' | 'expirada' | 'bloqueada'
}

export default function HorariosPage() {
  const [courts, setCourts] = useState<Court[]>([])
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null)
  const [selectedCampus, setSelectedCampus] = useState<number | null>(null)
  const [weekStart, setWeekStart] = useState<string>(weekStartYMD(limaYMD()))
  const [weekEnd, setWeekEnd] = useState<string>(addDaysYMD(weekStartYMD(limaYMD()), 6))
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; startTime: string; endTime: string } | null>(null)
  const [editingBlock, setEditingBlock] = useState<ScheduleBlock | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingUnblockId, setPendingUnblockId] = useState<number | null>(null)
  const [selectedClient, setSelectedClient] = useState<ClientSearchValue | null>(null)
  const [viewingReservation, setViewingReservation] = useState<ScheduleBlock | null>(null)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourt, weekStart, weekEnd, selectedClient?.id])

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
      const params = new URLSearchParams({
        action: 'blocked',
        court_id: String(selectedCourt),
        week_start: weekStart,
        week_end: weekEnd,
      })
      if (selectedClient?.id) params.set('usuarios_id', String(selectedClient.id))
      const response = await fetch(`/api/schedules?${params.toString()}`)
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
    const ns = addDaysYMD(weekStart, -7)
    setWeekStart(ns)
    setWeekEnd(addDaysYMD(ns, 6))
  }

  const handleNextWeek = () => {
    const ns = addDaysYMD(weekStart, 7)
    setWeekStart(ns)
    setWeekEnd(addDaysYMD(ns, 6))
  }

  const handleCellClick = (date: string, startTime: string, endTime: string) => {
    setSelectedSlot({ date, startTime, endTime })
    setShowBlockModal(true)
  }

  const handleBlockSaved = () => {
    setShowBlockModal(false)
    fetchSchedules()
  }

  const handleEditBlock = (block: ScheduleBlock) => {
    setEditingBlock(block)
  }

  const handleEditSaved = () => {
    setEditingBlock(null)
    fetchSchedules()
  }

  const handleUnblock = (scheduleId: number) => {
    setPendingUnblockId(scheduleId)
    setConfirmOpen(true)
  }

  const executeUnblock = async () => {
    if (!pendingUnblockId) return
    setConfirmOpen(false)

    try {
      const response = await fetch(`/api/schedules?id=${pendingUnblockId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        fetchSchedules()
      } else {
        setError(result.error || 'Error al liberar el horario')
      }
    } catch (err) {
      setError('Error al conectar con el servidor')
    } finally {
      setPendingUnblockId(null)
    }
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
            selectedClient={selectedClient}
            onCampusChange={setSelectedCampus}
            onCourtChange={setSelectedCourt}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onClientChange={setSelectedClient}
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
              onUnblock={handleUnblock}
              onEditBlock={handleEditBlock}
              onViewReservation={(b) => setViewingReservation(b)}
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

      {editingBlock && (
        <BlockModal
          courtId={selectedCourt!}
          blockId={editingBlock.id}
          initialDate={limaYMD(editingBlock.start_date)}
          initialStartTime={`${limaHour(editingBlock.start_date)
            .toString()
            .padStart(2, '0')}:${limaMinutes(editingBlock.start_date).toString().padStart(2, '0')}`}
          initialEndTime={`${limaHour(editingBlock.end_date)
            .toString()
            .padStart(2, '0')}:${limaMinutes(editingBlock.end_date).toString().padStart(2, '0')}`}
          initialReason={editingBlock.reason === 'Bloqueo Manual' ? '' : editingBlock.reason}
          createdByEmail={editingBlock.user_email}
          onClose={() => setEditingBlock(null)}
          onSave={handleEditSaved}
          onDelete={() => {
            const id = editingBlock.id
            setEditingBlock(null)
            handleUnblock(id)
          }}
        />
      )}

      {viewingReservation && viewingReservation.estado_db && viewingReservation.estado_db !== 'bloqueada' && (
        <ReservationDetailModal
          reservation={{
            id: viewingReservation.id,
            court_id: viewingReservation.court_id,
            start_date: viewingReservation.start_date,
            end_date: viewingReservation.end_date,
            code: viewingReservation.code ?? null,
            estado_db: viewingReservation.estado_db,
            user_nombre: viewingReservation.user_nombre,
            user_email: viewingReservation.user_email,
            usuarios_id: viewingReservation.usuarios_id ?? null,
            precio_total: viewingReservation.precio_total ?? null,
          }}
          canchaNombre={courts.find((c) => c.id === viewingReservation.court_id)?.nombre}
          onClose={() => setViewingReservation(null)}
        />
      )}

      <ConfirmModal
        isOpen={confirmOpen}
        title="Liberar Horario Bloqueado"
        message="¿Está seguro de que desea liberar este horario bloqueado? Esto eliminará el bloqueo y volverá a hacer disponible la cancha en este bloque."
        confirmText="Sí, liberar"
        cancelText="Cancelar"
        type="warning"
        onConfirm={executeUnblock}
        onCancel={() => {
          setConfirmOpen(false)
          setPendingUnblockId(null)
        }}
      />
    </div>
  )
}

