# 📋 ADMIN DEPORTE CANCHAS - PLAN DE DESARROLLO INTEGRAL

**Estado Actual**: Fases 5-12 Completadas ✅ - Dashboard, Espacios, Reservaciones, Horarios, Precios, Reportes, Configuración, Notificaciones RT
**Objetivo**: Completar Fases 13-14 (Testing y Deployment) para llevar el sistema a producción

---

## 📊 RESUMEN EJECUTIVO

| Aspecto | Estado | Progreso |
|--------|--------|----------|
| **Arquitectura & Setup** | ✅ Completo | 100% |
| **API Routes** | ✅ Completo (18 rutas) | 100% |
| **Service Layer** | ✅ Completo (9 servicios) | 100% |
| **Autenticación** | ✅ Completo (Java + JWT) | 100% |
| **Base de Datos** | ✅ Completo (10 tablas) | 100% |
| **Componentes Base** | ✅ Completo (7 componentes) | 100% |
| **Auth Pages** | ✅ Completo (login/register) | 100% |
| **Dashboard UI** | ✅ Completo (5 componentes) | 100% |
| **Espacios CRUD** | ✅ Completo (Campus + Courts) | 100% |
| **Reservaciones** | ✅ Completo (Table filtrable) | 100% |
| **Horarios** | ✅ Completo (Weekly Calendar) | 100% |
| **Precios** | ✅ Completo (Court/Campus pricing) | 100% |
| **Reportes** | ✅ Completo (Revenue analytics) | 100% |
| **Configuración** | ✅ Completo (Profile + Admins) | 100% |
| **Notificaciones RT** | ✅ Completo (SSE stream) | 100% |
| **Tests** | 🔄 Pendiente | 0% |
| **Deploy** | ❌ No iniciado | 0% |

---

## 🗺️ ESTRUCTURA DEL PROYECTO

```
Admin_DeporCanchas/
├── app/
│   ├── (auth)/                    # ✅ Pages públicas de autenticación
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── callback/page.tsx
│   ├── (dashboard)/               # 🔄 Pages protegidas del dashboard
│   │   ├── layout.tsx             # ✅ Layout con Header + Sidebar
│   │   ├── dashboard/page.tsx     # ✅ Dashboard principal + 5 gráficos
│   │   ├── espacios/page.tsx      # ✅ Campus + Courts CRUD (tabs)
│   │   ├── reservaciones/page.tsx # ✅ Table filtrable + detail panel
│   │   ├── horarios/page.tsx      # ✅ Weekly calendar with scheduling
│   │   ├── precios/page.tsx       # ✅ Pricing rules management
│   │   ├── reportes/page.tsx      # ✅ Revenue analytics
│   │   └── configuracion/page.tsx # ✅ Profile + Admins management
│   ├── api/                       # ✅ API routes (18 rutas)
│   │   ├── auth/
│   │   ├── campus/
│   │   ├── courts/
│   │   ├── reservations/
│   │   ├── pricing/
│   │   ├── schedules/
│   │   ├── payments/
│   │   ├── reports/
│   │   └── notifications/
│   ├── globals.css                # ✅ Tailwind global styles
│   └── layout.tsx                 # ✅ Root layout
├── components/                    # ✅ React components
│   ├── common/                    # ✅ Componentes reutilizables
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/                    # ✅ Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedLayout.tsx
│   ├── dashboard/                 # ✅ Dashboard components (5/5)
│   │   ├── KPICard.tsx           # ✅ KPI cards dinámicas
│   │   ├── ReservationChart.tsx  # ✅ LineChart reservas por día
│   │   ├── RevenueChart.tsx      # ✅ AreaChart ingresos con período selector
│   │   ├── EventsList.tsx        # ✅ Últimas 10 eventos/notificaciones
│   │   └── SportDistribution.tsx # ✅ PieChart reservas por deporte
│   ├── espacios/                 # ✅ Espacios components (6/6)
│   │   ├── CourtCard.tsx         # ✅ Card individual de cancha
│   │   ├── CampusCard.tsx        # ✅ Card individual de campus
│   │   ├── CourtModal.tsx        # ✅ Modal CRUD cancha
│   │   ├── CampusModal.tsx       # ✅ Modal CRUD campus
│   │   └── (integrado en page)   # ✅ Tabs: Por Cancha / Por Campus
│   ├── reservaciones/            # ✅ Reservaciones components (4/4)
│   │   ├── FilterBar.tsx         # ✅ 6 filtros (fecha, estado, email, etc)
│   │   ├── ReservationsTable.tsx # ✅ Tabla + detail panel lateral
│   │   ├── StatusBadge.tsx       # ✅ Badges coloreadas por estado
│   │   └── (integrado en page)   # ✅ Paginación + acciones
│   ├── horarios/                 # ✅ Horarios components (4/4)
│   │   ├── WeeklyCalendar.tsx    # ✅ Calendar grid display
│   │   ├── BlockModal.tsx        # ✅ Create/edit schedule blocks
│   │   ├── ScheduleCell.tsx      # ✅ Individual cell
│   │   └── ControlBar.tsx        # ✅ Navigation and filters
│   ├── precios/                  # ✅ Pricing components (4/4)
│   │   ├── PricingRuleCard.tsx   # ✅ Rule display
│   │   ├── PricingModal.tsx      # ✅ Create/edit modal
│   │   ├── PricingTab.tsx        # ✅ Tab management
│   │   └── (Bulk management)     # ✅ Implemented in PricingTab
│   ├── reportes/                 # ✅ Reports components (5/5)
│   │   ├── RevenueChart.tsx      # ✅ LineChart
│   │   ├── DistributionChart.tsx # ✅ PieChart
│   │   ├── RevenueCard.tsx       # ✅ KPI cards
│   │   ├── ReportsFilterBar.tsx  # ✅ Filters
│   │   └── (TransactionsList)    # ✅ Can add if needed
│   ├── configuracion/            # ✅ Settings components (4/4)
│   │   ├── ProfileTab.tsx        # ✅ Profile editor
│   │   ├── AdminsTab.tsx         # ✅ Admin manager
│   │   ├── AdminsList.tsx        # ✅ Admin table
│   │   └── AdminForm.tsx         # ✅ Create/edit form
├── services/                      # ✅ Business logic (9 servicios)
│   ├── auth-service.ts           # ✅ Java microservice integration
│   ├── campus-service.ts         # ✅
│   ├── courts-service.ts         # ✅
│   ├── reservations-service.ts   # ✅
│   ├── pricing-service.ts        # ✅
│   ├── schedules-service.ts      # ✅
│   ├── payments-service.ts       # ✅
│   ├── notifications-service.ts  # ✅
│   └── reports-service.ts        # ✅
├── lib/                           # ✅ Utilities & context
│   ├── auth-context.tsx          # ✅ Global auth state
│   ├── tokens.ts                 # ✅ JWT management
│   ├── supabase.ts               # ✅ Supabase client
│   └── constants.ts              # ✅ Constantes globales
├── types/                         # ✅ TypeScript types
│   ├── database.ts               # ✅ Database schema types
│   ├── auth.ts                   # ✅ Auth types
│   ├── api.ts                    # ✅ API response types
│   └── ui.ts                     # ✅ UI component types
├── utils/                         # ✅ Helpers
│   ├── validators.ts             # ✅ Form validation rules
│   ├── formatters.ts             # ✅ Data formatting functions
│   └── api-helpers.ts            # ✅ API call utilities
├── hooks/                         # ✅ Custom React hooks
│   ├── useAuth.ts                # ✅ Auth state hook
│   └── useNotifications.ts       # ❌ PENDIENTE (real-time)
├── middleware.ts                  # ✅ Route protection
├── next.config.ts                # ✅
├── tailwind.config.ts            # ✅
├── tsconfig.json                 # ✅
├── package.json                  # ✅
└── .env.local                    # ✅ (no versionado)
```

---

## 🎯 FASES DE DESARROLLO

### **FASE 4: CORRECCIONES PRE-RELEASE** ✅ COMPLETADA
- [x] Arquitectura sólida implementada
- [x] 18 API routes funcionando
- [x] 9 servicios completamente integrados
- [x] Autenticación con Java microservice operativa
- [x] 10 tablas de base de datos en Supabase

---

### **FASE 5: DASHBOARD PRINCIPAL** (3-4 días) ✅ COMPLETADA
**Archivo**: `/app/(dashboard)/dashboard/page.tsx`

**Status**: ✅ Implementado el 2026-05-12

**Completado**:
- [x] KPICard component (4 cards: usuarios, reservas, ingresos, pendientes)
- [x] ReservationChart component (LineChart con Recharts)
- [x] SportDistribution component (PieChart con distribución por deporte)
- [x] RevenueChart component (AreaChart con selector de período)
- [x] EventsList component (Últimas 10 eventos con timestamps)
- [x] Dashboard page integrada con todos los componentes
- [x] API integration con `/api/reports` 
- [x] Auto-refresh cada 30s
- [x] Error handling y loading states

---

### **FASE 6: SECCIÓN ESPACIOS** (3-4 días) ✅ COMPLETADA
**Archivo**: `/app/(dashboard)/espacios/page.tsx`

**Status**: ✅ Implementado el 2026-05-12

**Completado**:
- [x] CourtCard component (card visual para cada cancha)
- [x] CampusCard component (card visual para cada campus)
- [x] CourtModal component (formulario CRUD cancha)
- [x] CampusModal component (formulario CRUD campus)
- [x] Espacios page con tab navigation (Por Cancha / Por Campus)
- [x] CRUD completo: Create, Read, Update, Delete para ambas entidades
- [x] API integration con `/api/courts` y `/api/campus`
- [x] Confirmación antes de eliminar
- [x] Validación de campos requeridos
- [x] Responsive grid layout (1/2/3 columnas)

---

### **FASE 7: SECCIÓN RESERVACIONES** (3-4 días) ✅ COMPLETADA
**Archivo**: `/app/(dashboard)/reservaciones/page.tsx`

**Status**: ✅ Implementado el 2026-05-12

**Completado**:
- [x] FilterBar component (6 filtros: fecha, estado, email, campus, precio, cancha)
- [x] ReservationsTable component (tabla con hover effect)
- [x] StatusBadge component (badges coloreadas: pendiente/amarillo, reservado/violeta, finalizado/verde, cancelado/rojo)
- [x] Detail panel lateral (información completa de reserva)
- [x] Reservaciones page con integración completa
- [x] API integration con `/api/reservations`
- [x] Acciones: Cancelar, Marcar como Finalizado
- [x] Real-time filtering con múltiples criterios
- [x] Paginación funcional
- [x] Responsive layout grid

---

### **FASE 8: SECCIÓN HORARIOS** (3-4 días) 🔄 PRÓXIMA
**Archivo**: `/app/(dashboard)/horarios/page.tsx`

**Status**: ⏳ Próxima a implementar

#### Componentes:
1. **ControlBar**: Botones prev/next, rango de fechas, selector vista (Día/Semana), filtros (Campus/Cancha)
2. **WeeklyCalendar**: 
   - Grilla: 7 columnas (lun-dom) × N filas (6am-10pm)
   - Mostrar reservas como bloques verdes
   - Mostrar bloqueos como bloques rojos
   - Click en espacio vacío: abre BlockModal
3. **BlockModal**: Campos (todo_día, fecha, hora_inicio, hora_fin, repetición)
4. **ReservationDetail**: Al click en reserva, mostrar info

#### Archivos:
- `/components/horarios/ControlBar.tsx`
- `/components/horarios/WeeklyCalendar.tsx`
- `/components/horarios/ScheduleCell.tsx`
- `/components/horarios/BlockModal.tsx`
- `/components/horarios/ReservationPreview.tsx`
- `/app/(dashboard)/horarios/page.tsx`

#### API calls:
- GET `/api/schedules?action=availability&court_id=X&week_start=X&week_end=Y`
- POST `/api/schedules` - Crear bloqueo
- PUT `/api/schedules/[id]` - Editar bloqueo
- DELETE `/api/schedules/[id]` - Eliminar bloqueo

**Testing**:
- ✅ Calendario renderiza correctamente
- ✅ Reservas y bloques se visualizan
- ✅ Modal de bloqueo funciona
- ✅ Repeticiones funcionan (diaria, semanal, etc)
- ✅ Navegación de fechas funciona

---

### **FASE 9: SECCIÓN PRECIOS** (3-4 días)
**Archivo**: `/app/(dashboard)/precios/page.tsx`

**Objetivo**: Gestión de reglas de tarifas por cancha o campus

#### Componentes:
1. **Tab toggle**: "Por Cancha" | "Por Campus"
2. **Vista 1 - Por Cancha**:
   - Panel izquierdo: Selector Campus + Selector Cancha
   - Panel derecho: Tarjetas de reglas (drag & drop visual, prioridad)
   - Tarjeta "Precio Default" (fija al final)
   - Cada regla: mostrar título, campos activos, botones (Editar/Eliminar)
   - Botón "Agregar configuración"

3. **Vista 2 - Por Campus**:
   - Selector Campus + Checkboxes de canchas
   - Card: Actualización Masiva Default (input precio + botón "Aplicar")
   - Formulario: Crear regla y aplicar a múltiples canchas

4. **PricingModal**: Formulario completo para crear/editar regla

#### Archivos:
- `/components/precios/PricingTab.tsx` - Wrapper tabs
- `/components/precios/ByCourtView.tsx` - Vista por cancha
- `/components/precios/ByCampusView.tsx` - Vista por campus
- `/components/precios/PricingRuleCard.tsx` - Card de regla
- `/components/precios/PricingModal.tsx` - Modal crear/editar
- `/app/(dashboard)/precios/page.tsx`

#### API calls:
- GET `/api/pricing` - Listar tarifas
- POST `/api/pricing` - Crear
- PUT `/api/pricing/[id]` - Actualizar
- DELETE `/api/pricing/[id]` - Eliminar
- GET `/api/courts?campus_id=X` - Para asignar tarifas

**Testing**:
- ✅ CRUD de tarifas completo
- ✅ Prioridades se respetan
- ✅ Aplicación masiva funciona
- ✅ Validación de campos

---

### **FASE 10: SECCIÓN REPORTES** (3-4 días)
**Archivo**: `/app/(dashboard)/reportes/page.tsx`

**Objetivo**: Visualización de ingresos y comparaciones con gráficos

#### Componentes:
1. **FilterBar**: Selector período (Día/Semana/Mes) + Date picker + Campus/Cancha opcional
2. **KPI Cards**: Ingresos totales, promedio por reserva, cantidad reservas, variación
3. **MainChart**: LineChart o AreaChart de ingresos en el tiempo
4. **DistributionChart**: PieChart/DonutChart de ingresos por deporte
5. **ComparisonChart**: BarChart o mini LineChart comparando períodos
6. **TransactionsList**: Tabla de movimientos recientes paginada

#### Archivos:
- `/components/reportes/FilterBar.tsx`
- `/components/reportes/KPICard.tsx` (reutilizar)
- `/components/reportes/RevenueChart.tsx`
- `/components/reportes/DistributionChart.tsx`
- `/components/reportes/ComparisonChart.tsx`
- `/components/reportes/TransactionsList.tsx`
- `/app/(dashboard)/reportes/page.tsx`

#### API calls:
- GET `/api/reports?type=revenue&startDate=X&endDate=Y` - Ingresos en período
- GET `/api/reports?type=dashboard` - KPIs
- GET `/api/reports?type=compare&period1_start=X&period1_end=Y&period2_start=Z&period2_end=W` - Comparación
- GET `/api/reports?type=by-deport&startDate=X&endDate=Y` - Por deporte
- GET `/api/payments` - Listado de movimientos

**Testing**:
- ✅ Gráficos se renderizan correctamente
- ✅ Filtros actualizen gráficos
- ✅ Datos se cargan correctamente
- ✅ Responsive en móvil
- ✅ Estados vacíos manejados

---

### **FASE 11: SECCIÓN CONFIGURACIÓN** (2-3 días)
**Archivo**: `/app/(dashboard)/configuracion/page.tsx`

**Objetivo**: Gestión de perfil y administradores

#### Componentes:
1. **ProfileTab**: 
   - Formulario: Nombre, Email, Usuario
   - Seguridad: Contraseña actual, nueva, confirmar
   - Botones: Guardar, Cancelar

2. **AdminsTab**:
   - Tabla de administradores: Nombre, Email, Usuario, Estado, Acciones (Editar/Eliminar)
   - Botón: "Nuevo administrador"
   - Modal crear/editar admin
   - Confirmación antes de eliminar

#### Archivos:
- `/components/configuracion/ProfileTab.tsx`
- `/components/configuracion/AdminsTab.tsx`
- `/components/configuracion/AdminForm.tsx`
- `/components/configuracion/AdminsList.tsx`
- `/app/(dashboard)/configuracion/page.tsx`

#### API calls:
- GET `/api/auth/profile` - Info actual del user
- PUT `/api/auth/profile` - Actualizar perfil
- PUT `/api/auth/password` - Cambiar contraseña
- GET `/api/auth/admins` - Listar administradores
- POST `/api/auth/admins` - Crear admin
- PUT `/api/auth/admins/[id]` - Editar admin
- DELETE `/api/auth/admins/[id]` - Eliminar admin

**Testing**:
- ✅ Edición de perfil funciona
- ✅ Cambio de contraseña valida correctamente
- ✅ CRUD de admins completo
- ✅ Confirmaciones funcionan
- ✅ Validaciones de campos

---

### **FASE 12: NOTIFICACIONES EN TIEMPO REAL** (3-4 días)
**Objetivo**: Sistema de notificaciones WebSocket o SSE

#### Opciones:
1. **WebSocket** (Recomendado para tiempo real)
   - Librería: `socket.io-client` o `ws`
   - Server: Implementar en Next.js con `node-ws`
   - Cliente: Hook `useNotifications.ts`

2. **Server-Sent Events (SSE)** (Más simple)
   - Client: EventSource API nativa
   - Server: API route `/api/notifications/stream`
   - Cliente: Hook `useNotifications.ts`

#### Tareas:
1. Crear hook `useNotifications.ts` para conectar a WS/SSE
2. Crear API route `/api/notifications/stream` para SSE
3. Implementar reconexión automática
4. Mostrar toast notification en Header cuando llega notificación
5. Marcar como leído al hacer click

**Testing**:
- ✅ Conexión establece correctamente
- ✅ Notificaciones llegan en tiempo real
- ✅ Reconexión automática funciona
- ✅ Toast se muestra y desaparece

---

### **FASE 13: TESTING** (4-5 días)

#### 13.1 Unit Tests - Servicios
- **Framework**: Jest + Vitest
- **Target**: `services/*.ts` (9 archivos)
- **Coverage Goal**: 80%+
- Archivos: `/services/__tests__/*.test.ts`

#### 13.2 Integration Tests - API Routes
- **Framework**: Jest + supertest
- **Target**: `app/api/**/route.ts` (18 rutas)
- **Coverage Goal**: 80%+
- Archivos: `/app/api/__tests__/*.test.ts`

#### 13.3 Component Tests
- **Framework**: React Testing Library
- **Target**: Dashboard + CRUD components
- **Focus**: User interactions, data rendering
- Archivos: `/components/__tests__/*.test.tsx`

#### 13.4 End-to-End Tests
- **Framework**: Playwright o Cypress
- **Scenarios**:
  - Login → Dashboard → Ver datos
  - Crear campus → Crear cancha → Verificar en lista
  - Hacer reserva → Cambiar estado → Cancelar
- Archivos: `/e2e/*.spec.ts`

**Testing Checklist**:
- [ ] Ejecutar tests localmente
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Coverage report (>80%)
- [ ] Tests en staging antes de deploy

---

### **FASE 14: DEPLOYMENT** (2-3 días)

#### 14.1 Pre-Deployment Checklist
- [ ] Compilar sin errores: `npm run build`
- [ ] Tipos TypeScript correctos: `npm run type-check`
- [ ] Linting: `npm run lint`
- [ ] Tests pasando: `npm run test`
- [ ] Variables de entorno configuradas (`.env.production`)
- [ ] Supabase RLS habilitado y políticas configuradas
- [ ] Java microservice accesible desde servidor de producción
- [ ] CORS configurado correctamente

#### 14.2 Deployment Options
**Opción A: Vercel (Recomendado para Next.js)**
1. Conectar repo a Vercel
2. Configurar variables de entorno
3. Deploy automático en push a main
4. Dominio personalizado configurado

**Opción B: AWS / Google Cloud**
1. Docker image: Crear Dockerfile
2. CI/CD pipeline: GitHub Actions
3. Servidor: EC2 / App Engine
4. Base de datos: Supabase (ya en cloud)

**Opción C: Servidor Propio**
1. SSH a servidor
2. Clone repo
3. Instalar Node.js + npm
4. `npm install && npm run build`
5. PM2 para process management
6. Nginx reverse proxy

#### 14.3 Post-Deployment
- [ ] Verificar todas las rutas funcionan
- [ ] Probar auth flow completo
- [ ] Verificar gráficos renderizan datos
- [ ] Comprobar notificaciones funcionan
- [ ] Monitor performance (Vercel Analytics)
- [ ] Configurar logging (Sentry)
- [ ] Backup de base de datos automático (Supabase)

---

## 🏗️ DECISIONES ARQUITECTÓNICAS

### 1. **Estructura de Componentes**
- ✅ **Component Colocation**: Componentes en carpetas por feature (`/dashboard`, `/espacios`, etc)
- ✅ **Compound Components**: Algunos componentes complejos usan patrón compound (ej: Modal con Header/Body/Footer)
- ✅ **Custom Hooks**: Lógica reutilizable en `/hooks` (useAuth, useNotifications, etc)

### 2. **Estado Global**
- ✅ **Auth Context**: Único estado global de autenticación (`/lib/auth-context.tsx`)
- ✅ **Zustand**: Para estado de UI complejo si es necesario (instalado pero aún no usado)
- ✅ **React Query**: NO usado, confiamos en useEffect + estado local
- ✅ **Notificaciones**: React Hot Toast para feedback visual

### 3. **API Communication**
- ✅ **Axios**: Cliente HTTP centralizado (`/lib/supabase.ts`)
- ✅ **Error Handling**: Centralized error handling en interceptores
- ✅ **Loading States**: Manejados a nivel componente (useState)
- ✅ **Token Refresh**: Automático en interceptores de Axios

### 4. **Validación**
- ✅ **Zod**: Schema validation en forms (instalado)
- ✅ **React Hook Form**: Integración con Zod para validaciones
- ✅ **Server-side**: Validaciones adicionales en API routes

### 5. **Styling**
- ✅ **Tailwind CSS v4**: Utility-first CSS framework
- ✅ **Paleta**: Verde principal, gris claro fondo, blanco cards
- ✅ **Responsive**: Mobile-first approach con breakpoints (sm, md, lg, xl)
- ✅ **Componentes**: shadcn/ui para componentes complejos (Dialog, Popover, etc)

### 6. **Base de Datos**
- ✅ **Supabase PostgreSQL**: Única fuente de verdad
- ✅ **RLS**: Requiere configuración de políticas por rol
- ✅ **Indexes**: Ya creados para performance
- ✅ **Migrations**: Versionadas en Supabase

### 7. **Autenticación**
- ✅ **Java Microservice**: Endpoint externo en `localhost:8080/api/v1/auth`
- ✅ **JWT**: AccessToken (1 hora) + RefreshToken (rotativo)
- ✅ **Storage**: localStorage (CAMBIAR a httpOnly cookies en prod)
- ✅ **Middleware**: Protege rutas `/dashboard/*` y similares

### 8. **Testing**
- ✅ **Jest**: Framework principal de tests
- ✅ **React Testing Library**: Para tests de componentes
- ✅ **Playwright/Cypress**: Para E2E tests
- ✅ **GitHub Actions**: CI/CD pipeline

---

## 🔧 PATRONES DE CÓDIGO

### Componente Funcional Standard
```tsx
// /components/example/ExampleComponent.tsx
import { ReactNode } from 'react'

interface ExampleComponentProps {
  title: string
  children?: ReactNode
  onAction?: () => void
}

export function ExampleComponent({
  title,
  children,
  onAction
}: ExampleComponentProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Action
        </button>
      )}
    </div>
  )
}
```

### Custom Hook Standard
```tsx
// /hooks/useExample.ts
import { useState, useEffect } from 'react'

export function useExample() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // fetch logic
  }, [])

  return { data, loading, error }
}
```

### Service Function Standard
```tsx
// /services/example-service.ts
import { supabase } from '@/lib/supabase'

export async function getExampleData() {
  const { data, error } = await supabase
    .from('table_name')
    .select('*')

  if (error) throw error
  return data
}
```

### API Route Standard
```tsx
// /app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getExampleData } from '@/services/example-service'

export async function GET(request: NextRequest) {
  try {
    const data = await getExampleData()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Error message' }, { status: 500 })
  }
}
```

---

## 📊 ESTIMACIÓN DE TIEMPO

| Fase | Descripción | Tiempo | Recurso |
|------|-------------|--------|---------|
| 5 | Dashboard Principal | 3-4 días | Frontend |
| 6 | Sección Espacios | 3-4 días | Frontend |
| 7 | Sección Reservaciones | 3-4 días | Frontend |
| 8 | Sección Horarios | 3-4 días | Frontend |
| 9 | Sección Precios | 3-4 días | Frontend |
| 10 | Sección Reportes | 3-4 días | Frontend |
| 11 | Sección Configuración | 2-3 días | Frontend |
| 12 | Notificaciones RT | 3-4 días | Frontend |
| 13 | Testing | 4-5 días | QA/Frontend |
| 14 | Deployment | 2-3 días | DevOps |
| **TOTAL** | **7 fases de UI + tests + deploy** | **30-38 días** | **1 dev** |

---

## ⚠️ PROBLEMAS CONOCIDOS & SOLUCIONES

### Problema 1: Dynamic Route Params (Next.js 16)
**Síntoma**: Errores con `params: { id }` en rutas `[id]/route.ts`
**Solución**: Cambiar a `params: Promise<{ id }>` y usar `await params`
**Archivo afectado**: `/app/api/*/[id]/route.ts` (6 rutas)
**Prioridad**: ⚠️ CRÍTICA - Corregir ANTES de compilar

### Problema 2: Row-Level Security (RLS) No Configurado
**Síntoma**: Cualquier usuario puede acceder a cualquier dato
**Solución**: Habilitar RLS en Supabase y crear políticas por rol
**Impacto**: Seguridad crítica
**Prioridad**: 🔴 CRÍTICA - Implementar ANTES de deploy

### Problema 3: JWT en localStorage
**Síntoma**: Token expuesto a XSS
**Solución**: Cambiar a httpOnly cookies + CSRF tokens
**Archivos**: `/lib/tokens.ts`, `/middleware.ts`
**Prioridad**: 🔴 CRÍTICA - Para producción

### Problema 4: Sin Refresh Token Proactivo
**Síntoma**: Usuario ve error 401 en token expirando
**Solución**: Implementar refresh proactivo 5 min antes de expirar
**Archivo**: `/lib/auth-context.tsx` - agregar timer
**Prioridad**: 🟡 Media - Para UX fluida

### Problema 5: Notificaciones sin Real-time
**Síntoma**: Usuario debe refrescar para ver nuevas notificaciones
**Solución**: Implementar WebSocket o SSE (FASE 12)
**Prioridad**: 🟡 Media - FASE 12

### Problema 6: Disponibilidad de Canchas Compleja
**Síntoma**: Lógica de ocupación no clara
**Solución**: Revisar `schedules-service.ts`, agregar tests
**Prioridad**: 🟡 Media - FASE 13 (testing)

---

## 🧪 ESTRATEGIA DE TESTING

### Testing Pyramid
```
         E2E (5-10%)
       /             \
   Integration (20-30%)
   /                   \
Unit Tests (60-70%)
```

### Test Coverage Goals
- **Services**: 80%+ (9 servicios)
- **API Routes**: 80%+ (18 rutas)
- **Components**: 60%+ (dashboard + CRUD)
- **Global**: 75%+ total

### Test Execution
```bash
# Unit + Integration
npm run test

# Con coverage
npm run test:coverage

# E2E
npm run test:e2e

# CI/CD (GitHub Actions)
git push → GitHub Actions → Tests → Deploy
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment (1 día)
- [ ] `npm run build` sin errores
- [ ] `npm run type-check` sin errores
- [ ] `npm run lint` sin errores
- [ ] `npm run test` pasando todos
- [ ] `.env.production` configurado
- [ ] Supabase RLS habilitado
- [ ] Java microservice accesible desde prod
- [ ] CORS configurado

### Deployment (1 día)
- [ ] Código pushado a main
- [ ] CI/CD pipeline ejecutó exitosamente
- [ ] Vercel/AWS/Servidor actualizado
- [ ] Dominio apuntando correctamente
- [ ] SSL certificado válido

### Post-Deployment (1 día)
- [ ] Probar auth flow completo
- [ ] Dashboard carga datos reales
- [ ] CRUD operaciones funcionan
- [ ] Gráficos renderizan correctamente
- [ ] Filtros funcionan
- [ ] Performance acceptable (<3s carga)
- [ ] Error logging funciona (Sentry)
- [ ] Analytics habilitado (Vercel)
- [ ] Backups automáticos (Supabase)
- [ ] Documentación actualizada

---

## 📝 RESUMEN DE ARCHIVOS CRÍTICOS

### Implementados ✅
- `/lib/auth-context.tsx` - Context autenticación
- `/lib/tokens.ts` - JWT management
- `/middleware.ts` - Route protection
- `/types/database.ts` - Database types
- `/services/*.ts` - 9 servicios business logic
- `/app/api/**` - 18 API routes (Fixed Next.js 16 types)
- `/components/layout/*.tsx` - Layout base
- `/components/common/*.tsx` - UI components base
- `/components/dashboard/*.tsx` - 5 Dashboard components ✅
- `/components/espacios/*.tsx` - 4 Espacios components ✅
- `/components/reservaciones/*.tsx` - 3 Reservaciones components ✅
- `/app/(dashboard)/dashboard/page.tsx` - Dashboard page ✅
- `/app/(dashboard)/espacios/page.tsx` - Espacios page ✅
- `/app/(dashboard)/reservaciones/page.tsx` - Reservaciones page ✅

### Por Crear 🔄
- `/hooks/useNotifications.ts` - Real-time hook ✅ COMPLETADO
- `/__tests__/**` - Test files (Fase 13)
- Deployment configuration (Fase 14)

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

### Ya Implementado ✅
- Middleware protege rutas
- Tokens JWT con expiración
- Variables de entorno para secretos
- Validación básica en servicios

### Requiere Atención 🔴
- [ ] RLS en Supabase (CRÍTICA)
- [ ] httpOnly cookies (CRÍTICA)
- [ ] CSRF tokens en forms
- [ ] SQL injection prevention (usar Supabase)
- [ ] XSS prevention (sanitizar inputs)
- [ ] Rate limiting en API
- [ ] CORS restrictivo
- [ ] Logging de accesos
- [ ] Rotación regular de tokens
- [ ] Audit trail para cambios críticos

---

## 📱 RESPONSIVE DESIGN

### Breakpoints Tailwind
- `sm`: 640px (mobile)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (large desktop)

### Mobile-First Strategy
```tsx
// Default: mobile
<div className="grid grid-cols-1 gap-4">
  {/* Grid de 1 columna en móvil */}
  
  {/* md: 2 columnas en tablet */}
  {/* lg: 4 columnas en desktop */}
  <div className="md:grid-cols-2 lg:grid-cols-4" />
</div>
```

---

## 🎨 GUÍA DE ESTILOS

### Colores
- **Verde Primario**: `#10b981` (green-600) - Botones, acciones principales
- **Gris Fondo**: `#f3f4f6` (gray-100) - Background
- **Blanco**: `#ffffff` - Cards
- **Gris Texto**: `#374151` (gray-700) - Texto principal
- **Rojo Negativos**: `#ef4444` (red-500) - Delete, cancel, blocked
- **Verde Positivos**: `#10b981` (green-600) - Success, active
- **Amarillo Avisos**: `#f59e0b` (amber-500) - Pending, warning
- **Morado Info**: `#8b5cf6` (violet-600) - Reservado
- **Azul Info**: `#3b82f6` (blue-600) - Info, secondary

### Espaciado
```
p-4  = 1rem
p-6  = 1.5rem
gap-4 = 1rem
gap-6 = 1.5rem
mt-8 = 2rem (separación entre secciones)
```

### Typography
```
h1: text-4xl font-bold
h2: text-2xl font-bold
h3: text-lg font-semibold
p: text-sm text-gray-600
```

### Components
```
Card: bg-white rounded-lg shadow-sm p-6
Button: px-4 py-2 rounded-lg hover:opacity-90
Input: border border-gray-300 rounded-lg px-3 py-2
Modal: fixed inset-0 bg-black/50 flex items-center justify-center
```

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

### ✅ Completado Hoy (2026-05-12):
1. ✅ Fase 8: Horarios con calendario semanal (ControlBar, WeeklyCalendar, BlockModal, ScheduleCell)
2. ✅ Fase 9: Precios con gestión de tarifas (PricingTab, PricingRuleCard, PricingModal)
3. ✅ Fase 10: Reportes con gráficos de ingresos (RevenueChart, DistributionChart, ReportFilterBar)
4. ✅ Fase 11: Configuración con perfil y admins (ProfileTab, AdminsTab, AdminsList, AdminForm)
5. ✅ Fase 12: Notificaciones RT con SSE (useNotifications hook, notification stream API)
6. ✅ Build compila sin errores
7. ✅ 5 commits atómicos pushados a main

### 📋 Siguiente (Fase 13 - Testing):
1. **Unit Tests - Servicios** (~1-2 horas):
   - Setup Jest + Vitest
   - Tests para `/services/*.ts` (9 archivos)
   - Mock de Supabase
   - Coverage goal: 80%+

2. **Integration Tests - API Routes** (~2-3 horas):
   - Tests para `/app/api/**/route.ts` (18 rutas)
   - Mock de requests/responses
   - Validación de errores

3. **Component Tests** (~1-2 horas):
   - React Testing Library
   - Focus en CRUD components
   - User interactions

4. **E2E Tests** (~1-2 horas):
   - Playwright o Cypress
   - Login → Dashboard → CRUD flows

### 📋 Fase 14 - Deployment:
1. Pre-deployment checks
2. Seleccionar plataforma (Vercel, AWS, etc)
3. Configurar CI/CD
4. Deploy y validación

---

**Plan Creado**: 2026-05-11
**Plan Actualizado**: 2026-05-12 (Fases 8-12 completadas)
**Versión**: 1.2
**Maintainer**: Jose Medina
**Estado**: ✅ Fases 8-12 completadas | 🔄 Fase 13 (Testing) en progreso | ❌ Fase 14 (Deployment) pendiente
