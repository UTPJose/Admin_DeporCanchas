'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReportsFilterBar } from '@/components/reportes/ReportsFilterBar'
import { RevenueCard } from '@/components/reportes/RevenueCard'
import { RevenueChart } from '@/components/reportes/RevenueChart'
import { DistributionChart } from '@/components/reportes/DistributionChart'

interface ReportData {
  totalRevenue: number
  averageReservation: number
  totalReservations: number
  variationPercentage: number
  byDeport: Array<{ deport: string; amount: number }>
  dailyData: Array<{ date: string; revenue: number }>
}

export default function ReportesPage() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month')
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReportData()
  }, [period, startDate, endDate])

  const fetchReportData = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        type: 'revenue',
        startDate,
        endDate,
        period,
      })

      const response = await fetch(`/api/reports?${params}`)
      const result = await response.json()

      if (result.success) {
        setReportData({
          totalRevenue: result.data.totalRevenue || 0,
          averageReservation: result.data.averageReservation || 0,
          totalReservations: result.data.totalReservations || 0,
          variationPercentage: result.data.variationPercentage || 0,
          byDeport: result.data.byDeport || [],
          dailyData: result.data.dailyData || [],
        })
      } else {
        setError(result.error || 'Error al cargar reportes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
        <p className="text-gray-600 mt-1">Visualiza ingresos y estadísticas del sistema</p>
      </div>

      <Card>
        <ReportsFilterBar
          period={period}
          startDate={startDate}
          endDate={endDate}
          onPeriodChange={setPeriod}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />
      </Card>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : reportData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <RevenueCard
              label="Ingresos Totales"
              value={`$${reportData.totalRevenue.toFixed(2)}`}
              icon="DollarSign"
              trend={reportData.variationPercentage}
            />
            <RevenueCard
              label="Promedio por Reserva"
              value={`$${reportData.averageReservation.toFixed(2)}`}
              icon="TrendingUp"
            />
            <RevenueCard
              label="Total de Reservas"
              value={reportData.totalReservations.toString()}
              icon="Calendar"
            />
            <RevenueCard
              label="Variación"
              value={`${reportData.variationPercentage.toFixed(1)}%`}
              icon="BarChart3"
              isPercentage
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Día</h2>
              <RevenueChart data={reportData.dailyData} />
            </Card>

            <Card>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Por Deporte</h2>
              <DistributionChart data={reportData.byDeport} />
            </Card>
          </div>
        </>
      ) : null}
    </div>
  )
}

function getDefaultStartDate(): string {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}
