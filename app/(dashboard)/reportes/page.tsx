'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReportsFilterBar } from '@/components/reportes/ReportsFilterBar'
import { RevenueCard } from '@/components/reportes/RevenueCard'
import dynamic from 'next/dynamic'
import { Download, FileText, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const RevenueChart = dynamic(
  () => import('@/components/reportes/RevenueChart').then((m) => ({ default: m.RevenueChart })),
  { ssr: false }
)
const DistributionChart = dynamic(
  () => import('@/components/reportes/DistributionChart').then((m) => ({ default: m.DistributionChart })),
  { ssr: false }
)

interface ReportData {
  totalRevenue: number
  averageReservation: number
  totalReservations: number
  variationPercentage: number | null
  previousEmpty: boolean
  byDeport: Array<{ deport: string; amount: number }>
  byCourt: Array<{ cancha: string; amount: number }>
  dailyData: Array<{ date: string; revenue: number }>
}

export default function ReportesPage() {
  const { user, isLoading: authLoading } = useAuth()
  const isSuper = !!user?.isSuper
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
          reportData.previousEmpty
            ? 'Nuevo'
            : reportData.variationPercentage != null
              ? reportData.variationPercentage.toFixed(1)
              : '—',
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
    if (!reportData) return
    setExporting('pdf')
    try {
      const { default: jsPDF } = await import('jspdf')

      // PDF generado a partir de `reportData` (no se captura el DOM con
      // html2canvas porque no soporta colores oklch de Tailwind v4 y rompe).
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const marginX = 12
      const usableW = pageW - marginX * 2
      let y = 16

      // Asegura que no escribamos fuera de la página: si no hay espacio
      // suficiente para `needed` mm, añade una página y resetea `y`.
      const ensure = (needed: number) => {
        if (y + needed > pageH - 14) {
          pdf.addPage()
          y = 16
        }
      }

      // Header
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(17, 24, 39) // gray-900
      pdf.text('Reportes y Análisis', marginX, y)
      y += 7

      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(10)
      pdf.setTextColor(75, 85, 99) // gray-600
      pdf.text(`Período: ${startDate}  →  ${endDate}`, marginX, y)
      y += 4
      pdf.text(`Generado: ${new Date().toLocaleString('es-PE')}`, marginX, y)
      y += 6
      pdf.setDrawColor(229, 231, 235)
      pdf.line(marginX, y, marginX + usableW, y)
      y += 6

      // KPIs como cuadrícula 2x2
      const kpis: Array<[string, string]> = [
        ['Ingresos Totales', `S/ ${reportData.totalRevenue.toFixed(2)}`],
        ['Promedio por Reserva', `S/ ${reportData.averageReservation.toFixed(2)}`],
        ['Total de Reservas', String(reportData.totalReservations)],
        [
          'Variación',
          reportData.previousEmpty
            ? 'Nuevo'
            : reportData.variationPercentage != null
              ? `${reportData.variationPercentage.toFixed(1)} %`
              : '—',
        ],
      ]
      const cardW = (usableW - 6) / 2
      const cardH = 18
      ensure(cardH * 2 + 6)
      for (let i = 0; i < kpis.length; i++) {
        const col = i % 2
        const row = Math.floor(i / 2)
        const x = marginX + col * (cardW + 6)
        const cy = y + row * (cardH + 4)
        pdf.setDrawColor(229, 231, 235)
        pdf.setFillColor(249, 250, 251)
        pdf.roundedRect(x, cy, cardW, cardH, 2, 2, 'FD')
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.setTextColor(107, 114, 128)
        pdf.text(kpis[i][0], x + 4, cy + 6)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(13)
        pdf.setTextColor(17, 24, 39)
        pdf.text(kpis[i][1], x + 4, cy + 13)
      }
      y += cardH * 2 + 4 + 6

      // Helper: tabla simple con cabecera + filas y zebra
      const drawTable = (title: string, headers: [string, string], rows: Array<[string, string]>) => {
        ensure(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(12)
        pdf.setTextColor(17, 24, 39)
        pdf.text(title, marginX, y)
        y += 5

        const rowH = 7
        const col1W = usableW * 0.65
        const col2W = usableW - col1W

        // Header bar
        ensure(rowH)
        pdf.setFillColor(34, 197, 94)
        pdf.rect(marginX, y, usableW, rowH, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(255, 255, 255)
        pdf.text(headers[0], marginX + 2, y + 5)
        pdf.text(headers[1], marginX + col1W + 2, y + 5)
        y += rowH

        if (rows.length === 0) {
          ensure(rowH)
          pdf.setFont('helvetica', 'italic')
          pdf.setFontSize(10)
          pdf.setTextColor(156, 163, 175)
          pdf.text('Sin datos en el período.', marginX + 2, y + 5)
          y += rowH + 4
          return
        }

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(10)
        rows.forEach((r, i) => {
          ensure(rowH)
          if (i % 2 === 0) {
            pdf.setFillColor(249, 250, 251)
            pdf.rect(marginX, y, usableW, rowH, 'F')
          }
          pdf.setTextColor(31, 41, 55)
          // Truncar la primera columna si es muy larga
          const label = pdf.splitTextToSize(r[0], col1W - 4)[0] ?? r[0]
          pdf.text(label, marginX + 2, y + 5)
          pdf.text(r[1], marginX + col1W + col2W - 2, y + 5, { align: 'right' })
          y += rowH
        })
        // Línea inferior
        pdf.setDrawColor(229, 231, 235)
        pdf.line(marginX, y, marginX + usableW, y)
        y += 6
      }

      drawTable(
        'Ingresos por Día',
        ['Fecha', 'Monto (S/)'],
        reportData.dailyData.map((d) => [d.date, d.revenue.toFixed(2)])
      )
      drawTable(
        'Por Deporte',
        ['Deporte', 'Monto (S/)'],
        reportData.byDeport.map((d) => [d.deport, d.amount.toFixed(2)])
      )
      drawTable(
        'Ingresos por Cancha',
        ['Cancha', 'Monto (S/)'],
        reportData.byCourt.map((c) => [c.cancha, c.amount.toFixed(2)])
      )

      // Footer en cada página
      const pages = pdf.getNumberOfPages()
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175)
      for (let p = 1; p <= pages; p++) {
        pdf.setPage(p)
        pdf.text(`DeporCanchas · Reportes · página ${p} de ${pages}`, marginX, pageH - 6)
      }

      pdf.save(`reportes_${startDate}_${endDate}.pdf`)
    } catch (e) {
      console.error('Error generando PDF:', e)
      setError(e instanceof Error ? e.message : 'No se pudo generar el PDF')
    } finally {
      setExporting(null)
    }
  }

  // Al clickear los botones Hoy/Semana/Mes, además de cambiar el `period`
  // recalculamos start/end para que el API filtre el rango correcto. Si el
  // usuario edita los inputs de fecha manualmente, eso no se sobreescribe.
  const handlePeriodChange = (p: 'day' | 'week' | 'month') => {
    setPeriod(p)
    const today = new Date()
    const ymd = (d: Date) => d.toISOString().split('T')[0]
    if (p === 'day') {
      const t = ymd(today)
      setStartDate(t)
      setEndDate(t)
    } else if (p === 'week') {
      const from = new Date(today)
      from.setDate(today.getDate() - 6) // 7 días incluyendo hoy
      setStartDate(ymd(from))
      setEndDate(ymd(today))
    } else {
      const from = new Date(today)
      from.setDate(today.getDate() - 29) // 30 días incluyendo hoy
      setStartDate(ymd(from))
      setEndDate(ymd(today))
    }
  }

  useEffect(() => {
    if (!isSuper) return
    fetchReportData()
  }, [period, startDate, endDate, isSuper])

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
          variationPercentage: result.data.variationPercentage ?? null,
          previousEmpty: result.data.previousEmpty ?? true,
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isSuper) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
          <h2 className="text-lg font-semibold text-gray-900">Acceso restringido</h2>
          <p className="text-gray-600 max-w-sm">
            Reportes y Análisis es solo para el super-administrador.
          </p>
        </div>
      </Card>
    )
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
          onPeriodChange={handlePeriodChange}
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
              trend={reportData.previousEmpty ? null : reportData.variationPercentage}
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
              value={
                reportData.previousEmpty
                  ? 'Nuevo'
                  : reportData.variationPercentage != null
                    ? `${reportData.variationPercentage.toFixed(1)}%`
                    : '—'
              }
              icon="BarChart3"
              isPercentage={!reportData.previousEmpty && reportData.variationPercentage != null}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Ingresos por Día</h2>
                <span className="text-xs text-gray-400 uppercase tracking-wide">S/ Soles</span>
              </div>
              <RevenueChart data={reportData.dailyData} />
            </Card>

            <Card>
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Ingresos por Deporte</h2>
                <span className="text-xs text-gray-400 uppercase tracking-wide">S/ Soles</span>
              </div>
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
