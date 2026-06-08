'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReportsFilterBar } from '@/components/reportes/ReportsFilterBar'
import { RevenueCard } from '@/components/reportes/RevenueCard'
import { RevenueChart } from '@/components/reportes/RevenueChart'
import { DistributionChart } from '@/components/reportes/DistributionChart'
import { Download, FileText } from 'lucide-react'

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
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  // ====== Exportación ======

  const downloadFile = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /** Escapa un valor para CSV (comillas dobles + envuelve si tiene coma/quote/salto). */
  const csvCell = (v: unknown): string => {
    const s = v === null || v === undefined ? '' : String(v)
    if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const exportCSV = () => {
    if (!reportData) return
    setExporting('csv')
    try {
      const lines: string[] = []
      lines.push(`Reportes y Análisis`)
      lines.push(`Período;${startDate};${endDate}`)
      lines.push('')
      lines.push(`Ingresos Totales;Promedio por Reserva;Total Reservas;Variación %`)
      lines.push(
        [
          reportData.totalRevenue.toFixed(2),
          reportData.averageReservation.toFixed(2),
          reportData.totalReservations,
          reportData.variationPercentage.toFixed(1),
        ]
          .map(csvCell)
          .join(';')
      )
      lines.push('')
      lines.push('Ingresos por Día')
      lines.push('Fecha;Monto (S/)')
      reportData.dailyData.forEach((d) => lines.push([d.date, d.revenue.toFixed(2)].map(csvCell).join(';')))
      lines.push('')
      lines.push('Por Deporte')
      lines.push('Deporte;Monto (S/)')
      reportData.byDeport.forEach((d) => lines.push([d.deport, d.amount.toFixed(2)].map(csvCell).join(';')))
      lines.push('')
      lines.push('Ingresos por Cancha')
      lines.push('Cancha;Monto (S/)')
      reportData.byCourt.forEach((c) => lines.push([c.cancha, c.amount.toFixed(2)].map(csvCell).join(';')))

      // BOM + CRLF para que Excel abra bien en español
      const csv = '﻿' + lines.join('\r\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
      downloadFile(blob, `reportes_${startDate}_${endDate}.csv`)
    } finally {
      setExporting(null)
    }
  }

  const exportPDF = async () => {
    if (!reportData || !reportRef.current) return
    setExporting('pdf')
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ])
      // Capturar el contenedor del reporte tal cual aparece en pantalla
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // mejor resolución
        useCORS: true,
        logging: false,
      })
      const imgData = canvas.toDataURL('image/png')

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      // Convertir px del canvas a mm manteniendo el ratio
      const ratio = canvas.height / canvas.width
      const imgW = pageW - 20 // 10mm de margen a cada lado
      const imgH = imgW * ratio

      // Si entra en una página, lo coloco. Si no, lo divido en páginas.
      if (imgH <= pageH - 20) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH)
      } else {
        // Multi-page: corto el canvas verticalmente
        const sliceH = Math.floor(((pageH - 20) / imgW) * canvas.width)
        let y = 0
        let page = 0
        const tmp = document.createElement('canvas')
        const ctx = tmp.getContext('2d')!
        tmp.width = canvas.width
        while (y < canvas.height) {
          const h = Math.min(sliceH, canvas.height - y)
          tmp.height = h
          ctx.clearRect(0, 0, tmp.width, tmp.height)
          ctx.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h)
          const slice = tmp.toDataURL('image/png')
          if (page > 0) pdf.addPage()
          pdf.addImage(slice, 'PNG', 10, 10, imgW, (h / canvas.width) * imgW)
          y += h
          page++
        }
      }
      pdf.save(`reportes_${startDate}_${endDate}.pdf`)
    } finally {
      setExporting(null)
    }
  }

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-600 mt-1">Visualiza ingresos y estadísticas del sistema</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={exportCSV}
            disabled={!reportData || !!exporting}
            className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4" />
            {exporting === 'csv' ? 'Exportando…' : 'CSV'}
          </button>
          <button
            onClick={exportPDF}
            disabled={!reportData || !!exporting}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <FileText className="w-4 h-4" />
            {exporting === 'pdf' ? 'Generando…' : 'PDF'}
          </button>
        </div>
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
        <div ref={reportRef} className="space-y-6 bg-white p-4 rounded-lg">
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
        </div>
      ) : null}
    </div>
  )
}

function getDefaultStartDate(): string {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}
