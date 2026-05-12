# 🤖 AGENTS.md - Admin DeporCanchas

**Instrucciones para Claude/Agentes trabajando en este proyecto**

---

## 📍 Contexto del Proyecto

- **Proyecto**: Admin DeporCanchas - Sistema de gestión de canchas deportivas
- **Stack**: Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Supabase  
- **Estado**: Fase 4 completa (Backend ✅) → Fase 5+ (UI Development)
- **Plan Referencia**: Ver `/system-reminder-the-user-provided-proud-pixel.md`

### ⚠️ Next.js 16 - Breaking Changes
This version has breaking changes — APIs, conventions, and file structure may differ. Read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

---

## 🎯 Principios Clave

### Simplicidad
- No agrega features fuera de scope
- No refactoriza innecesariamente  
- No crea abstracciones prematuras
- Max 3 líneas similares antes de extraer helper

### Arquitectura
```
Services (lógica negocio) 
   ↓
API Routes (HTTP)
   ↓
Componentes (UI pura)
   + Hooks (estado/effects)
```

### TypeScript Obligatorio
- Todo tipado: `any` prohibido
- Interfaces explícitas en `/types/`
- Generics evitados a menos sea necesario

---

## ✅ Patrones Requeridos

### Componente
```tsx
// /components/[feature]/NameComponent.tsx
interface Props {
  title: string
  onAction?: () => void
}

export function NameComponent({ title, onAction }: Props) {
  return <div className="bg-white rounded-lg p-6 shadow-sm">{/* ... */}</div>
}
```

### Service
```tsx
// /services/name-service.ts
export async function functionName() {
  const { data, error } = await supabase.from('table').select('*')
  if (error) throw error
  return data
}
```

### API Route
```tsx
// /app/api/resource/route.ts
export async function GET(request: NextRequest) {
  try {
    const data = await functionFromService()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Message' }, { status: 500 })
  }
}
```

---

## 🎨 Estilos & Diseño

### Colores Permitidos
- Verde: `bg-green-600 hover:bg-green-700` (primario)
- Gris: `bg-gray-100` (fondo), `bg-gray-700` (texto)
- Blanco: `bg-white`
- Rojo: `bg-red-500` (negativo)
- Amarillo: `bg-amber-500` (warning)

### Espaciado Estándar
- Padding: `p-4` o `p-6`
- Gaps: `gap-4` o `gap-6`
- Separaciones: `mt-8`

### Responsive Mobile-First
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
  {/* 1 col mobile → 2 md → 4 lg */}
</div>
```

---

## 📂 Estructura Carpetas

```
✅ Implementado (No modificar estructura)
├── /components/common/        (Card, Button, etc)
├── /components/layout/        (Header, Sidebar)
├── /lib/                       (auth-context, tokens)
├── /services/                  (9 servicios CRUD)
├── /app/api/                   (18 rutas API)
├── /types/                     (interfaces TypeScript)

🔄 Por Crear (Fases 5-11)
├── /components/dashboard/     (5 componentes)
├── /components/espacios/      (4 componentes)
├── /components/reservaciones/ (3 componentes)
├── /components/horarios/      (4 componentes)
├── /components/precios/       (3 componentes)
├── /components/reportes/      (4 componentes)
├── /components/configuracion/ (3 componentes)
└── /app/(dashboard)/*/        (7 pages)
```

---

## 🚀 Prioridades

### CRÍTICO Primero
1. Tipos dinámicos: `params: Promise<{id}>` en `/app/api/*/[id]/route.ts`
2. Compilar: `npm run build` sin errores
3. Verificar tipos: `npm run type-check`

### Orden Fases (5-11)
| Fase | Tarea | Días |
|------|-------|------|
| 5 | Dashboard principal | 3-4 |
| 6 | Espacios (campus/canchas) | 3-4 |
| 7 | Reservaciones | 3-4 |
| 8 | Horarios (calendario) | 3-4 |
| 9 | Precios (tarifas) | 3-4 |
| 10 | Reportes (gráficos) | 3-4 |
| 11 | Configuración | 2-3 |
| 12 | Notificaciones RT | 3-4 |
| 13 | Testing | 4-5 |
| 14 | Deploy | 2-3 |

---

## ❌ Lo que NO Hacer

- [ ] Agregar comentarios de "qué hace" (el código debe serlo)
- [ ] Usar `any` en TypeScript
- [ ] CSS externo (solo Tailwind)
- [ ] Lógica en componentes (va en hooks/servicios)
- [ ] Props drilling profundo (usar Context)
- [ ] Cambiar APIs existentes
- [ ] Dependencias sin mencionar
- [ ] Modificar `/services/` sin revisar

---

## ✅ Lo que SÍ Hacer

- [ ] Tipado completo (interfaces explícitas)
- [ ] Props interfaces
- [ ] Loading/error states
- [ ] Validación server-side
- [ ] Commits descriptivos y frecuentes
- [ ] Componentes pequeños y reutilizables
- [ ] Funciones puras
- [ ] Validación con Zod

---

## 🧪 Testing por Componente

- [ ] Props válidas requeridas
- [ ] Estados: loading, error, empty
- [ ] Responsive: móvil/tablet/desktop
- [ ] Accesibilidad: alt text, labels

---

## 🔧 Comandos

```bash
npm run dev              # localhost:3000
npm run type-check      # Verificar tipos
npm run build           # Build producción
npm run lint            # ESLint
npm run test            # Jest (futuro)
npm run test:e2e        # E2E (futuro)
```

---

## 🔐 Seguridad

### ✅ Implementado
- Middleware protege rutas
- JWT con expiración
- Variables de entorno

### 🔴 CRÍTICO Pendiente
- [ ] RLS en Supabase
- [ ] httpOnly cookies (prod)
- [ ] CSRF tokens
- [ ] Rate limiting

---

## 📞 Referencias

- **Plan completo**: `/system-reminder-the-user-provided-proud-pixel.md`
- **DB Types**: `/types/database.ts`
- **Auth**: `/lib/auth-context.tsx`, `/middleware.ts`
- **APIs**: Plan Fases 5-11
- **Java Service**: `localhost:8080/api/v1/auth`

---

## 🎓 Convenciones

### Nombres de Archivos
- Componentes: `PascalCase.tsx` (ej: `DashboardCard.tsx`)
- Servicios: `kebab-case.ts` (ej: `campus-service.ts`)
- Hooks: `use` prefix (ej: `useAuth.ts`)
- Types: `kebab-case.ts` (ej: `database.ts`)

### Variables
- Constantes: `UPPERCASE_SNAKE_CASE`
- Funciones: `camelCase`
- Interfaces: `PascalCase` + `Props` (ej: `DashboardProps`)
- Booleanos: `is`/`has` prefix (ej: `isLoading`)

---

**Versión**: 1.0 | **Actualizado**: 2026-05-11 | **Responsable**: Jose Medina
