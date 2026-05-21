'use client'

import { useEffect, useState } from 'react'
import { KPICard } from '@/components/dashboard/KPICard'
import { ReservationChart } from '@/components/dashboard/ReservationChart'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { SportDistribution } from '@/components/dashboard/SportDistribution'
import { EventsList } from '@/components/dashboard/EventsList'
import { useAuth } from '@/hooks/useAuth'

interface DashboardStats {
  totalUsuarios: number
  totalReservas: number
  totalIngresos: number
  pendientes: number
  usuariosTrend?: number
  reservasTrend?: number
  ingresosTrend?: number
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
  const { user, isLoading: isAuthLoading } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [reservations, setReservations] = useState<ReservationData[]>([])
  const [sports, setSports] = useState<SportsData[]>([])
  const [revenue, setRevenue] = useState<RevenueData[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resDays, setResDays] = useState<number>(7)
  const [resLoading, setResLoading] = useState<boolean>(false)

  const handlePeriodChange = async (period: 'week' | 'month' | 'year') => {
    try {
      const res = await fetch(`/api/reports?type=revenue&period=${period}`)
      if (res.ok) {
        const revenueData = await res.json()
        if (revenueData.data) {
          const rawList = Array.isArray(revenueData.data)
            ? revenueData.data
            : (revenueData.data.dailyData || [])
          setRevenue(
            rawList.map((item: any) => ({
              date: item.date || item.periodo || item.fecha || '',
              ingresos: item.ingresos || item.monto || item.revenue || 0,
            }))
          )
        }
      }
    } catch (err) {
      console.error('Error fetching revenue by period:', err)
    }
  }

  useEffect(() => {
    if (isAuthLoading || !user) return

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [statsRes, sportsRes, revenueRes, eventsRes] = await Promise.all([
          fetch('/api/reports?type=dashboard&days=7'),
          fetch('/api/reports?type=by-deport'),
          fetch('/api/reports?type=revenue&period=week'),
          fetch(`/api/notifications?user_id=${user.id}&limit=10`),
        ])

        if (!statsRes.ok || !sportsRes.ok || !revenueRes.ok || !eventsRes.ok) {
          throw new Error('Error al cargar datos del dashboard')
        }

        const statsData = await statsRes.json()
        const sportsData = await sportsRes.json()
        const revenueData = await revenueRes.json()
        const eventsData = await eventsRes.json()

        // Handle both camelCase and snake_case returned from reports-service, plus dynamic monthly trends
        setStats({
          totalUsuarios: statsData.data?.totalUsuarios ?? statsData.data?.total_usuarios ?? 0,
          totalReservas: statsData.data?.totalReservas ?? statsData.data?.total_reservas ?? 0,
          totalIngresos: statsData.data?.totalIngresos ?? statsData.data?.total_ingresos ?? 0,
          pendientes: statsData.data?.pendientes ?? statsData.data?.total_pendientes ?? 0,
          usuariosTrend: statsData.data?.usuariosTrend ?? statsData.data?.usuarios_trend ?? 0,
          reservasTrend: statsData.data?.reservasTrend ?? statsData.data?.reservas_trend ?? 0,
          ingresosTrend: statsData.data?.ingresosTrend ?? statsData.data?.ingresos_trend ?? 0,
        })

        // Map sports data from { deporte, cantidad } to { name, value }
        if (sportsData.data) {
          setSports(
            sportsData.data.map((item: any) => ({
              name: item.name || item.deporte || 'Deporte',
              value: item.value || item.cantidad || 0,
            }))
          )
        }

        if (revenueData.data) {
          const rawList = Array.isArray(revenueData.data)
            ? revenueData.data
            : (revenueData.data.dailyData || [])
          setRevenue(
            rawList.map((item: any) => ({
              date: item.date || item.periodo || item.fecha || '',
              ingresos: item.ingresos || item.monto || item.revenue || 0,
            }))
          )
        }

        if (eventsData.data) {
          setEvents(
            eventsData.data.slice(0, 10).map((item: any) => ({
              id: item.id,
              title: item.titulo || item.title || 'Evento',
              description: item.descripcion || item.description,
              timestamp: item.timestamp || item.created_at || new Date().toISOString(),
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
  }, [user, isAuthLoading])

  useEffect(() => {
    if (isAuthLoading || !user) return

    const fetchReservationsOnly = async () => {
      try {
        setResLoading(true)
        const res = await fetch(`/api/reports?type=dashboard&days=${resDays}`)
        if (res.ok) {
          const statsData = await res.json()
          if (statsData.data?.reservas_por_dia || statsData.data?.reservasAgrupadas) {
            const list = statsData.data.reservas_por_dia || statsData.data.reservasAgrupadas
            setReservations(
              list.map((item: any) => ({
                day: item.dia || item.day || '',
                reservas: item.cantidad || item.reservas || 0,
              }))
            )
          }
        }
      } catch (err) {
        console.error('Error fetching reservations:', err)
      } finally {
        setResLoading(false)
      }
    }

    fetchReservationsOnly()
  }, [user, isAuthLoading, resDays])


  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Verificando sesión...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800 text-sm">Inicie sesión para acceder al panel administrativo.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
        <p className="text-gray-600 mt-1">Bienvenido al sistema de gestión DeporCanchas, {user.nombre}</p>
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
          trend={stats?.usuariosTrend}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Total Reservas"
          value={stats?.totalReservas || 0}
          icon="📦"
          trend={stats?.reservasTrend}
          trendLabel="vs mes anterior"
        />
        <KPICard
          title="Ingresos"
          value={`S/ ${stats?.totalIngresos?.toLocaleString('es-PE') || '0'}`}
          icon="💰"
          trend={stats?.ingresosTrend}
          trendLabel="vs mes anterior"
        />
        <KPICard 
          title="Pendientes" 
          value={stats?.pendientes || 0} 
          icon="⏳" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReservationChart 
          data={reservations.length > 0 ? reservations : []} 
          loading={resLoading} 
          days={resDays}
          onDaysChange={setResDays}
        />
        <SportDistribution data={sports.length > 0 ? sports : []} loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart 
            data={revenue.length > 0 ? revenue : []} 
            loading={loading} 
            onPeriodChange={handlePeriodChange}
          />
        </div>
        <EventsList events={events} loading={loading} />
      </div>
    </div>
  )
}
