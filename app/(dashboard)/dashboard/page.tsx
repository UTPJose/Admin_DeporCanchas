import { Card, CardHeader, CardContent } from '@/components/common/Card'

/**
 * Dashboard Page - Panel principal
 */

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-text-dark">Panel Administrativo</h1>
        <p className="text-text-secondary mt-1">Bienvenido al sistema de gestión DeporCanchas</p>
      </div>

      {/* Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: 'Total Usuarios', value: '0', icon: '👥' },
          { title: 'Total Reservas', value: '0', icon: '📦' },
          { title: 'Ingresos', value: 'S/ 0.00', icon: '💰' },
          { title: 'Pendientes', value: '0', icon: '⏳' },
        ].map((stat, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">{stat.title}</p>
                <p className="text-2xl font-bold text-text-dark mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Content Placeholder */}
      <Card>
        <CardHeader>Contenido en desarrollo</CardHeader>
        <CardContent>
          <p className="text-text-secondary">Las gráficas y estadísticas se implementarán en las siguientes fases.</p>
        </CardContent>
      </Card>
    </div>
  )
}
