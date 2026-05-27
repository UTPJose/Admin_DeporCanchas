'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { ReservationChart } from '@/components/dashboard/ReservationChart'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { SportDistribution } from '@/components/dashboard/SportDistribution'
import { EventsList } from '@/components/dashboard/EventsList'

interface DashboardStats {
  totalUsuarios: number
  totalReservas: number
  totalIngresos: number
  pendientes: number
}

interface ReservationData {
  day: string
  reservas: number
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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [sports, setSports] = useState<SportsData[]>([])
  const [revenue, setRevenue] = useState<RevenueData[]>([])
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
          fetch('/api/reports?type=revenue&period=week'),
          fetch('/api/notifications?limit=10'),
        ])

        if (!statsRes.ok || !sportsRes.ok || !revenueRes.ok || !eventsRes.ok) {
          throw new Error('Error al cargar datos del dashboard')
        }

        const statsData = await statsRes.json()
        const sportsData = await sportsRes.json()
        const revenueData = await revenueRes.json()
        const eventsData = await eventsRes.json()

        setStats({
          totalUsuarios: statsData.data?.total_usuarios || 0,
          totalReservas: statsData.data?.total_reservas || 0,
          totalIngresos: statsData.data?.total_ingresos || 0,
          pendientes: statsData.data?.total_pendientes || 0,
        })

        // by-deport devuelve { deporte, cantidad } → { name, value }
        setSports(
          (sportsData.data || []).map((item: any) => ({
            name: item.deporte ?? item.name ?? 'Otro',
            value: item.cantidad ?? item.value ?? 0,
          }))
        )

        // type=revenue ahora devuelve un objeto; el chart usa dailyData [{date, revenue}]
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
  }, [])

  const mockReservations: ReservationData[] = [
    { day: 'Lun', reservas: 12 },
    { day: 'Mar', reservas: 19 },
    { day: 'Mié', reservas: 15 },
    { day: 'Jue', reservas: 25 },
    { day: 'Vie', reservas: 32 },
    { day: 'Sáb', reservas: 28 },
    { day: 'Dom', reservas: 18 },
  ]

  const mockRevenue: RevenueData[] = [
    { date: '01 May', ingresos: 2400 },
    { date: '02 May', ingresos: 3210 },
    { date: '03 May', ingresos: 2290 },
    { date: '04 May', ingresos: 2000 },
    { date: '05 May', ingresos: 2181 },
    { date: '06 May', ingresos: 2500 },
    { date: '07 May', ingresos: 2100 },
  ]

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
          title="Total Usuarios"
          value={stats?.totalUsuarios || 0}
          icon="👥"
          trend={12}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Total Reservas"
          value={stats?.totalReservas || 0}
          icon="📦"
          trend={8}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Ingresos"
          value={`S/ ${stats?.totalIngresos?.toLocaleString('es-PE') || '0'}`}
          icon="💰"
          trend={15}
          trendLabel="vs mes anterior"
        />
        <KPICard title="Pendientes" value={stats?.pendientes || 0} icon="⏳" trend={-5} trendLabel="vs mes anterior" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationChart data={reservations.length > 0 ? reservations : mockReservations} loading={loading} />
        <SportDistribution data={sports.length > 0 ? sports : []} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenue.length > 0 ? revenue : mockRevenue} loading={loading} />
        </div>
        <EventsList events={events} loading={loading} />
      </div>
    </div>
  )
}

