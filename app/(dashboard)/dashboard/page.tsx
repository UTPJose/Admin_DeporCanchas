'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { KPICard } from '@/components/dashboard/KPICard'
import { EventsList } from '@/components/dashboard/EventsList'
import type { DashboardKPI } from '@/types/database'

const ReservationChart = dynamic(
  () => import('@/components/dashboard/ReservationChart').then((m) => ({ default: m.ReservationChart })),
  { ssr: false }
)
const RevenueChart = dynamic(
  () => import('@/components/dashboard/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
)
const SportDistribution = dynamic(
  () => import('@/components/dashboard/SportDistribution').then((m) => ({ default: m.SportDistribution })),
  { ssr: false }
)

interface DashboardData {
  totalUsuarios: number
  usuariosMes: DashboardKPI
  reservasMes: DashboardKPI
  ingresosMes: DashboardKPI
  pendientesActual: number
  reservasPorDia: { day: string; reservas: number }[]
}

interface SportsData {
  name: string
  value: number
}

interface RevenueData {
  date: string
  ingresos: number
}

interface Event {
  id: number
  title: string
  description?: string
  timestamp: string
  icon?: string
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [sports, setSports] = useState<SportsData[]>([])
  const [revenue, setRevenue] = useState<RevenueData[]>([])
  const [revenuePeriod, setRevenuePeriod] = useState<'day' | 'week' | 'month'>('week')
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [statsRes, sportsRes, revenueRes, eventsRes] = await Promise.all([
          fetch('/api/reports?type=dashboard'),
          fetch('/api/reports?type=by-deport'),
          fetch(`/api/reports?type=revenue&period=${revenuePeriod}`),
          fetch('/api/notifications?limit=10'),
        ])

        if (!statsRes.ok || !sportsRes.ok || !revenueRes.ok || !eventsRes.ok) {
          throw new Error('Error al cargar datos del dashboard')
        }

        const statsData = await statsRes.json()
        const sportsData = await sportsRes.json()
        const revenueData = await revenueRes.json()
        const eventsData = await eventsRes.json()

        const s = statsData.data
        if (s) {
          setData({
            totalUsuarios: s.total_usuarios ?? 0,
            usuariosMes: s.usuarios_mes ?? { valor: 0, variacion: null, previousEmpty: true },
            reservasMes: s.reservas_mes ?? { valor: 0, variacion: null, previousEmpty: true },
            ingresosMes: s.ingresos_mes ?? { valor: 0, variacion: null, previousEmpty: true },
            pendientesActual: s.pendientes_actual ?? 0,
            reservasPorDia: (s.reservas_por_dia ?? []).map((d: { dia: string; cantidad: number }) => ({
              day: d.dia,
              reservas: d.cantidad,
            })),
          })
        }

        setSports(
          (sportsData.data || []).map((item: any) => ({
            name: item.deporte ?? item.name ?? 'Otro',
            value: item.cantidad ?? item.value ?? 0,
          }))
        )

        const daily = revenueData.data?.dailyData ?? []
        if (Array.isArray(daily)) {
          setRevenue(
            daily.map((item: any) => ({
              date: item.date ?? item.periodo ?? '',
              ingresos: item.revenue ?? item.monto ?? 0,
            }))
          )
        }

        if (eventsData.data) {
          setEvents(
            eventsData.data.slice(0, 10).map((item: any) => ({
              id: item.id,
              title: item.titulo || item.title || 'Evento',
              description: item.mensaje || item.descripcion || item.description,
              timestamp: item.creado_en || item.timestamp || item.created_at || new Date().toISOString(),
            }))
          )
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
        console.error('Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [revenuePeriod])

  // KPIs por defecto cuando aún no llegó la data
  const usuariosMes = data?.usuariosMes ?? { valor: 0, variacion: null, previousEmpty: false }
  const reservasMes = data?.reservasMes ?? { valor: 0, variacion: null, previousEmpty: false }
  const ingresosMes = data?.ingresosMes ?? { valor: 0, variacion: null, previousEmpty: false }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
        <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión DeporCanchas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Usuarios totales"
          subtitle="Histórico"
          value={data?.totalUsuarios ?? 0}
          icon="👥"
          trend={usuariosMes.variacion}
          previousEmpty={usuariosMes.previousEmpty}
          trendLabel={`nuevos este mes: ${usuariosMes.valor}`}
        />
        <KPICard
          title="Reservas pagadas"
          subtitle="Este mes"
          value={reservasMes.valor}
          icon="📦"
          trend={reservasMes.variacion}
          previousEmpty={reservasMes.previousEmpty}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Ingresos"
          subtitle="Este mes"
          value={`S/ ${ingresosMes.valor.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon="💰"
          trend={ingresosMes.variacion}
          previousEmpty={ingresosMes.previousEmpty}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Pendientes ahora"
          subtitle="En tiempo real"
          value={data?.pendientesActual ?? 0}
          icon="⏳"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationChart data={data?.reservasPorDia ?? []} loading={loading} />
        <SportDistribution data={sports} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            data={revenue}
            loading={loading}
            period={revenuePeriod}
            onPeriodChange={setRevenuePeriod}
          />
        </div>
        <EventsList events={events} loading={loading} />
      </div>
    </div>
  )
}
