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
  byCourt: Array<{ cancha: string; amount: number }>
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
          byCourt: result.data.byCourt || [],
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
              value={`S/ ${reportData.totalRevenue.toFixed(2)}`}
              icon="DollarSign"
              trend={reportData.variationPercentage}
            />
            <RevenueCard
              label="Promedio por Reserva"
              value={`S/ ${reportData.averageReservation.toFixed(2)}`}
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

          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ingresos por Cancha</h2>
            {reportData.byCourt.length === 0 ? (
              <p className="text-gray-500 text-sm">Sin datos en el período.</p>
            ) : (
              <div className="space-y-2">
                {reportData.byCourt.map((c) => {
                  const max = reportData.byCourt[0]?.amount || 1
                  return (
                    <div key={c.cancha} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 text-sm text-gray-700 truncate">{c.cancha}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(c.amount / max) * 100}%` }} />
                      </div>
                      <span className="w-24 shrink-0 text-right text-sm font-semibold text-gray-900">
                        S/ {c.amount.toFixed(2)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
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
