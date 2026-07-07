# Reglas de trabajo

Piensa antes de actuar. Lee los archivos antes de escribir código.
Edita solo lo que cambia, no reescribas archivos enteros.
No releas archivos que ya hayas leído salvo que hayan cambiado.
No repitas código sin cambios en tus respuestas.
Sin preámbulos, sin resúmenes al final, sin explicar lo obvio.
Testea antes de dar por terminado.

# Panel Admin — DeporCanchas

Contraparte admin del cliente (`../Reservas_DeporCanchas/`). **Misma BD Supabase y mismo esquema.** El esquema y las reglas compartidas viven en el `CLAUDE.md` raíz (`../CLAUDE.md`).

## Stack

Next.js 16 (App Router) + React 19 + TS · Tailwind 4 · lucide-react · recharts · Supabase (misma instancia) · bcryptjs + jose · zod · react-hook-form · zustand · Vitest (tests unitarios de lógica pura).

## Auth (unificado con el cliente, endurecido)

- **Mismo motor que el cliente**: bcrypt (`usuarios.clave_hash`) + JWT (`jose`) sobre `usuarios`/`roles`. **Sin microservicio Java.**
- Cookie `admin_session`: `httpOnly + Secure + SameSite=Strict`, **1 día**, secret propio `ADMIN_JWT_SECRET`.
- `requireAdmin()` en **todos** los Route Handlers de datos (`campus`, `courts`, `court-types`, `pricing`, `reports`, `reservations`, `schedules`, `payments`, `notifications`, `usuarios/search`, `admins`, `perfil/auth`): valida JWT + re-consulta BD (`roles_id = admin` y `esta_activo`). Antes de esta ronda de hardening, la mayoría de estas rutas dependían solo del `middleware.ts` (que valida la firma del JWT pero no revalida el estado en BD) — ahora cada Route Handler llama `requireAdmin()` explícitamente.
- Login **rechaza** rol ≠ admin. Rate limit 5/min por IP.
- **Sin registro público.** Primer admin sembrado (script). Admins extra se crean **solo desde Configuración**, y solo por el **super-admin** (`lib/auth/requireAdmin.ts`: `SUPER_ADMIN_EMAIL`, cae a `admin@deporcanchas.com` si no está en env). `requireSuperAdmin()` protege crear/editar/activar-desactivar/resetear clave de otros admins (`POST`/`PATCH /api/admins*`); un admin regular recibe 403. Cualquier admin (regular o super) puede operar el resto del panel normalmente.
- Middleware protege `/(dashboard)/*` → sin sesión admin redirige a `/login`. Es una primera barrera (evita render de la página), no reemplaza `requireAdmin()` en las API routes.
- `lib/auth/` (password, session, requireAdmin) espejo del cliente. Se eliminaron `auth-service.ts`, `tokens.ts`, `api-client.ts` (capa Java) y rutas `auth/refresh`, `auth/verify`, páginas `register`/`callback`.

## Estados (real vs mostrado)

- BD real: `pendiente | pagada | cancelada | expirada`. **No se agregan estados.**
- Mostrado (derivado en `lib/estado-reserva.ts`): `pagada`+pasado → **Finalizada**; `pagada`+futuro → **Programada**; `pendiente` → **Pendiente de pago**; `cancelada` → **Cancelada**; `expirada` → **Expirada**.
- `StatusBadge` usa estos 5 (se elimina `reservado/finalizado/cancelado` y aliases legacy de `constants.ts`).
- Canchas: vocabulario único en español `activo | inactivo | mantenimiento` (se elimina `active/maintenance/inactive` y `disponible/bloqueado`).
- **Tipos de cancha**: tabla `tipos_cancha` (`valor` sin tildes = lo que se guarda en `canchas_deportivas.tipo_deporte`; `etiqueta` con tildes = display; `activo`). Gestionable desde **Espacios → Tipos de Cancha** (`/api/court-types`): crear, editar etiqueta, activar/desactivar. `valor` es **inmutable** tras crearse (cambiarlo dejaría huérfanas las canchas). El selector de `CourtModal` lista solo los activos; `lib/constants.ts` `TIPOS_CANCHA`/`tipoCanchaLabel` quedan solo como fallback de etiqueta para valores legacy.
- **Bloqueo de horarios** (`/horarios`): `reservas` con `estado='bloqueada'` (precio 0); el cliente lo ve como slot **Bloqueado**. El bloqueo se registra con `usuarios_id` = **admin logueado** que lo crea (vía `requireAdmin()` en la ruta) — nunca un cliente ni un usuario "de sistema". Cualquier admin puede crear/editar/liberar bloqueos; el cliente no participa. El **motivo** se persiste en `reservas.motivo`. En el calendario, clic en una celda bloqueada abre el modal de detalle/edición (cambiar fecha/hora/motivo, ver quién lo creó, o eliminar) — `PATCH /api/schedules` para editar, `DELETE` para liberar (ambos protegidos con `requireAdmin()`). Calendario y bloqueos en **hora de pared Lima** (`lib/lima-time.ts`, UTC-5), se convierten a instante UTC al guardar — admin y cliente muestran la misma hora. La ventana semanal usa `[lunes 00:00 Lima, lunes siguiente 00:00 Lima)`. No usar `getUTCHours`/`toISOString` crudos para fechas de calendario.

## Precios e imágenes

- **Precios** (`/precios`): una "regla" = fila en `tarifas` + enlace en `tarifas_canchasdep`. Tipos: **Días de la semana** (`tarifas.dias smallint[]`, 0=Dom..6=Sáb), **Días + Horas**, **Rango de fechas**. **Menor `prioridad` gana** (el cliente `calcularPrecioReserva` ordena asc y toma la primera que cumpla día+hora+fecha; precio = `precio_reemplazo ?? tarifas.precio`). Si nada matchea → **`canchas_deportivas.precio_default`** (fallback). Cálculo del cliente en **hora Lima** (día/hora/fecha), no `getHours()` crudo.
  - **Por Cancha**: reglas arrastrables (drag = prioridad, arriba gana → `POST /api/pricing/reorder {ids}`), card "Precio Default" editable (`PUT /api/courts/[id] {precio_default}`).
  - **Por Campus**: checklist + actualización masiva del default (`POST /api/pricing/default {court_ids,precio_default}`) + inyección de una regla **copiada independiente y colocada primera** en cada cancha (`POST /api/pricing {court_ids,...}`).
  - `GET /api/pricing?court_id=`, `POST` (court_id o court_ids), `PUT/DELETE /api/pricing/[id]` (id = tarifa). Todas protegidas con `requireAdmin()`.
- **Reportes** (`/reportes`): `GET /api/reports?type=revenue&startDate&endDate` → `getRevenueReport` devuelve `{totalRevenue, totalReservations, averageReservation, variationPercentage (vs período anterior), byDeport (etiqueta con tilde), byCourt, dailyData}`. Moneda **S/**. `reports-service.ts` también expone `getOccupancyRate()`, pero es un stub que retorna `[]` y no está enchufado a `type=` en la API — pendiente de implementar o retirar.
- **Imágenes de cancha**: columna `canchas_deportivas.imagen_url`; subida vía `POST /api/courts/image` (multipart, service_role) al bucket público `canchas`. El cliente muestra `imagen_url` si existe, si no cae al placeholder por tipo.

## Datos / clientes Supabase

- **Todos los services usan `service_role`** (server-only, vía Route Handlers). Usar el cliente anon en services rompe lectura/escritura por RLS — fue la causa de "espacios no guarda" y del error del dashboard. `lib/supabase.ts` ya **no exporta** un cliente anon ni helpers `fetch*` (se eliminaron por no tener uso real y ser el patrón que causaba esos bugs) — solo exporta `supabaseAdmin`.

## Acciones admin

- **Cancelar** reserva `pagada`/`pendiente` sin la regla de 24h del cliente — única acción sobre una reserva existente, vía `PATCH /api/reservations/[id]` (protegido con `requireAdmin()`). Ya no expone `PUT`/`DELETE`: nada se borra físicamente (es un `estado='cancelada'`), así que el verbo correcto es `PATCH`, no `DELETE`. Se quitó "Marcar finalizado".
- CRUD de `campus`, `canchas_deportivas`, `tarifas`/`tarifas_canchasdep`, `cancha_disponibilidad`.
- Crear/activar/desactivar admins (nunca borrar) — solo el super-admin, ver sección Auth.
- Solo **consulta** pagos/vouchers/historial (no emite ni escribe historial — lo llena el trigger). `app/api/payments/*` expone únicamente `GET`; los métodos `createPayment`/`updatePaymentStatus` de `payments-service.ts` **siguen existiendo pero ya no tienen ningún Route Handler que los llame** (se quitaron los `POST`/`PUT` de `/api/payments` por no ser parte del alcance del admin). No se borraron del service por si se retoman a futuro.

## Notificaciones

- El panel usa **polling REST**: la campana de `Header.tsx` y `/notificaciones` consultan `GET /api/notifications?audience=admin` y marcan leídas con `POST /api/notifications/admin/mark-read`. Esto es lo único que funciona end-to-end.
- Se **eliminó** un sistema paralelo de notificaciones en tiempo real vía SSE (`/api/notifications/stream`, `hooks/useNotifications.ts`, `components/common/NotificationList.tsx`) que nunca llegó a conectarse: nadie invocaba `broadcastNotification` ni abría el `EventSource`. Si se quiere real-time de verdad a futuro, evaluar un proveedor administrado (Supabase Realtime, Pusher) en vez de SSE con estado en memoria de proceso (no sobrevive a múltiples instancias serverless de Vercel).

## Deuda técnica conocida (sin resolver a propósito)

- `services/reservations-service.ts`: `updateReservation()` y `changeReservationStatus()` quedaron **sin ningún caller** tras consolidar las acciones de reservación en `cancelReservation()` (usado por el único `PATCH`). Se mantienen por si se necesita un update genérico a futuro.
- `services/payments-service.ts`: `createPayment()` y `updatePaymentStatus()` sin caller, ver sección Acciones admin.
- `reports-service.ts#getOccupancyRate()`: stub sin implementar, ver sección Precios e imágenes.

## Hora Lima en la API de reservaciones

- `GET /api/reservations` y `GET /api/reservations/[id]` devuelven, además de `fecha_empieza`/`fecha_termina` en ISO (UTC, para quien necesite el instante exacto), los campos **`hora_inicio`/`hora_fin`** en formato `'HH:MM'` ya calculados en hora de pared Lima (`lib/lima-time.ts#limaHM`, en `reservations-service.ts`). Es la misma fuente de verdad que usan calendario y bloqueos — ningún consumidor de la API debe reimplementar la conversión de zona horaria con `Intl.DateTimeFormat` o `getUTCHours` por su cuenta; `app/(dashboard)/reservaciones/page.tsx` ya solo formatea la fecha (`fmtFecha`) y consume `hora_inicio`/`hora_fin` directo del backend.

## Páginas

`/login` · `/dashboard` (KPIs+gráficos) · `/espacios` (campus+canchas) · `/reservaciones` (tabla+filtros+detalle) · `/horarios` (calendario+bloqueos) · `/precios` · `/reportes` · `/configuracion` (perfil + admins).

## Tests

`lib/lima-time.test.ts` y `lib/estado-reserva.test.ts` (Vitest) cubren la lógica pura de conversión de hora Lima y derivación de estado mostrado/filtros. `npm test` corre la suite. No hay tests de Route Handlers ni end-to-end — se sigue validando el resto manualmente.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=        # misma que cliente
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # misma
SUPABASE_SERVICE_ROLE_KEY=       # misma (solo server)
ADMIN_JWT_SECRET=                # propio del admin (openssl rand -base64 32)
SUPER_ADMIN_EMAIL=               # opcional; default admin@deporcanchas.com si no se define
```

## Fuera de alcance

Emisión de vouchers (lo hace el cliente) · pasarela real / OSE · notificaciones en tiempo real (SSE removido, ver sección Notificaciones) · tests end-to-end / de Route Handlers (sí hay unitarios de lógica pura, ver sección Tests).
