# 📋 ADMIN DEPORTE CANCHAS - PLAN DE DESARROLLO INTEGRAL

**Estado Actual**: Fase 4 Completa - Arquitectura sólida, APIs implementadas, lista para UI
**Objetivo**: Completar Fases 5-14 para llevar el sistema a producción

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
| **Dashboard UI** | 🔄 Pendiente | 0% |
| **Páginas Gestión** | ❌ No iniciado (6 páginas) | 0% |
| **Notificaciones RT** | ❌ No iniciado | 0% |
| **Tests** | ❌ No iniciado | 0% |
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
│   │   ├── dashboard/page.tsx     # 🔄 Dashboard principal (placeholder)
│   │   ├── espacios/page.tsx      # ❌ PENDIENTE (campus + canchas)
│   │   ├── reservaciones/page.tsx # ❌ PENDIENTE (reservations table)
│   │   ├── horarios/page.tsx      # ❌ PENDIENTE (calendar scheduling)
│   │   ├── precios/page.tsx       # ❌ PENDIENTE (pricing rules)
│   │   ├── reportes/page.tsx      # ❌ PENDIENTE (revenue analytics)
│   │   └── configuracion/page.tsx # ❌ PENDIENTE (settings)
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
│   ├── dashboard/                 # 🔄 Dashboard components
│   │   ├── KPICard.tsx           # ✅ Exists
│   │   ├── ReservationChart.tsx  # ❌ PENDIENTE
│   │   ├── RevenueChart.tsx      # ❌ PENDIENTE
│   │   ├── EventsList.tsx        # ❌ PENDIENTE
│   │   └── SportDistribution.tsx # ❌ PENDIENTE
│   ├── espacios/                 # ❌ PENDIENTE
│   │   ├── CampusList.tsx
│   │   ├── CourtsGrid.tsx
│   │   ├── CampusModal.tsx
│   │   └── CourtModal.tsx
│   ├── reservaciones/            # ❌ PENDIENTE
│   │   ├── ReservationsTable.tsx
│   │   ├── FilterBar.tsx
│   │   ├── ReservationDetail.tsx
│   │   └── StatusBadge.tsx
│   ├── horarios/                 # ❌ PENDIENTE
│   │   ├── WeeklyCalendar.tsx
│   │   ├── BlockModal.tsx
│   │   ├── ScheduleCell.tsx
│   │   └── TimeSelector.tsx
│   ├── precios/                  # ❌ PENDIENTE
│   │   ├── PricingRules.tsx
│   │   ├── PricingCard.tsx
│   │   ├── BulkUpdateModal.tsx
│   │   └── PriorityIndicator.tsx
│   ├── reportes/                 # ❌ PENDIENTE
│   │   ├── RevenueChart.tsx
│   │   ├── ComparisonChart.tsx
│   │   ├── RevenueTable.tsx
│   │   └── PeriodSelector.tsx
│   └── configuracion/            # ❌ PENDIENTE
│       ├── ProfileTab.tsx
│       ├── AdminsTab.tsx
│       ├── AdminForm.tsx
│       └── AdminsList.tsx
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

### **FASE 5: DASHBOARD PRINCIPAL** (3-4 días) 🔄 EN PROGRESO
**Archivo**: `/app/(dashboard)/dashboard/page.tsx`

**Objetivo**: Conectar datos reales de `/api/reports?type=dashboard` a la UI

#### Tareas:
1. **Crear componentes KPI cards dinámicos**
   - Archivo: `/components/dashboard/KPICard.tsx`
   - Props: `title`, `value`, `icon`, `trend`, `trendValue`
   - Consumir: `/api/reports?type=dashboard` → `dashboardStats`
   - Campos a mostrar:
     - Total Usuarios (de usuarios)
     - Total Reservas (count de reservas)
     - Total Ingresos (sum de pagos)
     - Reservas Pendientes (count where estado='pendiente')

2. **Crear gráfico de Reservas en la Semana**
   - Archivo: `/components/dashboard/ReservationChart.tsx`
   - Tipo: LineChart (Recharts)
   - Data: Reservas por día de la semana (lunes → domingo)
   - API: `/api/reports?type=dashboard` → `reservasXDia`
   - Props: data array, loading state

3. **Crear gráfico de Reservaciones por Deporte**
   - Archivo: `/components/dashboard/SportDistribution.tsx`
   - Tipo: PieChart o DonutChart (Recharts)
   - Data: % de reservas por deporte (fútbol, vóley, básquet, tenis)
   - API: `/api/reports?type=by-deport` → `reservesByDeport`
   - Props: data, colors palette

4. **Crear gráfico de Ingresos**
   - Archivo: `/components/dashboard/RevenueChart.tsx`
   - Tipo: LineChart o AreaChart
   - Controles: Selector de período (Día/Semana/Mes)
   - API: `/api/reports?type=revenue&period={periodo}`
   - Props: period, data, onChange handler

5. **Crear lista de Últimos Eventos**
   - Archivo: `/components/dashboard/EventsList.tsx`
   - Data: Últimas 10 notificaciones con iconos y timestamps
   - API: `/api/notifications?limit=10`
   - Props: events[], loading, onViewAll handler

6. **Actualizar dashboard/page.tsx**
   - Integrar todos los componentes
   - Layout: Grid responsivo (KPIs fila superior, gráficos abajo)
   - Estados de carga: Skeleton loaders
   - Manejo de errores: Toast notifications
   - Refresh de datos: useEffect con intervalo de 30s

**Estilos**:
- KPI Cards: bg-white, rounded-lg, p-6, shadow-sm
- Gráficos: bg-white, rounded-lg, p-6, shadow-sm
- Colores: Verde primario para números positivos, gris para neutrales
- Espaciado: gap-6 entre cards

**Testing**:
- ✅ Verificar que `/api/reports?type=dashboard` retorna datos válidos
- ✅ Comprobar que los gráficos se renderizan correctamente
- ✅ Validar responsive design en móvil/tablet
- ✅ Verificar skeleton loaders durante carga
- ✅ Comprobar manejo de errores (API down)

---

### **FASE 6: SECCIÓN ESPACIOS** (3-4 días)
**Archivo**: `/app/(dashboard)/espacios/page.tsx`

**Objetivo**: CRUD para campus y canchas con grid visual

#### Componentes a crear:
1. **Tab toggle**: "Por Cancha" | "Por Campus"
2. **Vista 1 - Gestión por Cancha**
   - SearchBar + Campus Filter + "Agregar Cancha" button
   - Grid responsivo de CourtCards
   - Cada card: imagen, nombre, tipo_deporte, cantidad_jugadores, estado badge, botones (Editar/Eliminar)
   - Modal crear/editar: campos (campus, nombre, tipo, jugadores, estado)
   - Modal confirmación eliminar

3. **Vista 2 - Gestión por Campus**
   - SearchBar + "Agregar Campus" button
   - Grid de CampusCards con banner, nombre, stats (canchas, reservas)
   - Al click en campus: expandir panel con detalles + grid de canchas
   - Modal crear/editar campus

#### Archivos:
- `/components/espacios/CourtsTab.tsx` - Vista por cancha
- `/components/espacios/CampusTab.tsx` - Vista por campus
- `/components/espacios/CourtCard.tsx` - Card individual de cancha
- `/components/espacios/CampusCard.tsx` - Card individual de campus
- `/components/espacios/CourtModal.tsx` - Modal CRUD cancha
- `/components/espacios/CampusModal.tsx` - Modal CRUD campus
- `/app/(dashboard)/espacios/page.tsx` - Page principal

#### API calls:
- GET `/api/courts?campus_id=X` - Listar canchas
- GET `/api/courts/[id]` - Detalle cancha
- POST `/api/courts` - Crear
- PUT `/api/courts/[id]` - Actualizar
- DELETE `/api/courts/[id]` - Eliminar
- GET `/api/campus` - Listar campus
- POST `/api/campus` - Crear
- PUT `/api/campus/[id]` - Actualizar
- DELETE `/api/campus/[id]` - Eliminar

**Testing**:
- ✅ CRUD completo para campus
- ✅ CRUD completo para canchas
- ✅ Filtros funcionan correctamente
- ✅ Modales abren/cierran correctamente
- ✅ Validación de campos requeridos

---

### **FASE 7: SECCIÓN RESERVACIONES** (3-4 días)
**Archivo**: `/app/(dashboard)/reservaciones/page.tsx`

**Objetivo**: Tabla filtrable de reservaciones con detail panel

#### Componentes:
1. **FilterBar**: Dropdowns para Fecha, Campus, Cancha, Precio, Estado, Email
2. **ReservationsTable**: 
   - Columnas: Nombre, Email, Campus, Cancha, Fecha, Hora, Precio, Estado
   - Paginación: 10 items por página
   - Estado badges: colores (reservado=morado, finalizado=verde, cancelado=rojo, pendiente=amarillo)
   - Hover: fila resaltada, click abre detail
3. **DetailPanel**: Side panel o modal con:
   - Datos completos de la reserva
   - Botones: Cancelar, Cambiar estado, Ver comprobante

#### Archivos:
- `/components/reservaciones/FilterBar.tsx`
- `/components/reservaciones/ReservationsTable.tsx`
- `/components/reservaciones/StatusBadge.tsx`
- `/components/reservaciones/ReservationDetail.tsx`
- `/app/(dashboard)/reservaciones/page.tsx`

#### API calls:
- GET `/api/reservations?page=X&limit=10&filters` - Listar con filtros
- GET `/api/reservations/[id]` - Detalle
- PUT `/api/reservations/[id]` - Cambiar estado
- DELETE `/api/reservations/[id]` - Cancelar

**Testing**:
- ✅ Tabla muestra datos correctamente
- ✅ Filtros funcionan combinados
- ✅ Paginación funciona
- ✅ Detail panel muestra info completa
- ✅ Estado badges con colores correctos

---

### **FASE 8: SECCIÓN HORARIOS** (3-4 días)
**Archivo**: `/app/(dashboard)/horarios/page.tsx`

**Objetivo**: Calendario semanal con reservas y bloques, permitir bloquear horarios

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
- `/app/api/**` - 18 API routes
- `/components/layout/*.tsx` - Layout base
- `/components/common/*.tsx` - UI components base

### Por Crear 🔄
- `/components/dashboard/*.tsx` - Dashboard components (5)
- `/components/espacios/*.tsx` - Spaces management (4)
- `/components/reservaciones/*.tsx` - Reservations (3)
- `/components/horarios/*.tsx` - Schedules (4)
- `/components/precios/*.tsx` - Pricing (3)
- `/components/reportes/*.tsx` - Reports (4)
- `/components/configuracion/*.tsx` - Settings (3)
- `/app/(dashboard)/*/page.tsx` - 7 dashboard pages
- `/hooks/useNotifications.ts` - Real-time hook
- `/__tests__/**` - Test files

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

### Antes de Iniciar Fase 5:
1. **Corregir tipos dinámicos** (30 min)
   - Verificar `/app/api/*/[id]/route.ts`
   - Cambiar `params: {id}` → `params: Promise<{id}>`
   - Agregar `await params` en handlers

2. **Compilar y verificar** (15 min)
   - `npm run build`
   - `npm run type-check`

3. **Crear rama de desarrollo**
   - `git checkout -b develop`
   - Commits diarios en esta rama

4. **Iniciar FASE 5 - Dashboard**
   - Crear `/components/dashboard/` con KPI cards
   - Conectar a `/api/reports?type=dashboard`
   - Testing local en `localhost:3000/dashboard`

---

**Plan Creado**: 2026-05-11
**Versión**: 1.0
**Maintainer**: Jose Medina
**Estado**: Listo para FASE 5 (Frontend Development)
