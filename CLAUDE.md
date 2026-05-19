# Reglas de trabajo

Piensa antes de actuar. Lee los archivos antes de escribir código.
Edita solo lo que cambia, no reescribas archivos enteros.
No releas archivos que ya hayas leído salvo que hayan cambiado.
No repitas código sin cambios en tus respuestas.
Sin preámbulos, sin resúmenes al final, sin explicar lo obvio.
Testea antes de dar por terminado.

# Contexto del proyecto

**Panel de administración** del sistema de reservas de **DeporCanchas Lima S.A.C.** Es la contraparte admin del proyecto cliente que vive en `../Reservas_DeporCanchas/`. Ambos proyectos **comparten la misma base de datos Supabase** y deben respetar el mismo esquema.

- **Repo cliente (referencia obligatoria del schema):** `../Reservas_DeporCanchas/`
- **Spec del sistema completo:** `../Reservas_DeporCanchas/docs/superpowers/specs/2026-05-11-reservas-deporcanchas-design.md`
- **Plan de este admin:** `system-reminder-the-user-provided-proud-pixel.md`

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind 4 + lucide-react + recharts (gráficos) + shadcn/ui
- Supabase (Postgres + Storage) — **misma instancia que el cliente**
- **Auth vía microservicio Java Spring Boot** externo (`NEXT_PUBLIC_AUTH_SERVICE_URL` + `/api/v1/auth`). Devuelve `token`+`refreshToken`+`sessionToken` que se guardan en cookie (`Secure; SameSite=Lax`) y localStorage. Distinto al cliente, que sí usa JWT propio. La BD `usuarios.clave_hash` la administra el servicio Java. No mover esto.
- zod (validación), react-hook-form, zustand
- axios / fetch contra Route Handlers propios con `service_role`

## Decisiones de arquitectura clave (heredadas del cliente)

1. **Auth = microservicio Java externo.** El admin **solo acepta sesión con rol `admin`** (`ROLE_ADMIN` desde el servicio). El servicio valida contra la tabla `usuarios` (FK a `roles`). Los tokens se persisten en cookie no-HttpOnly (limitación de `document.cookie`) con `Secure; SameSite=Lax` y en `localStorage` como respaldo. **No hay JWT firmado en Next.js**. El cliente, en cambio, sí usa JWT propio — los dos flujos son distintos y conviven sobre la misma BD.
2. **Acceso a datos:** toda escritura y lectura sensible va por Route Handlers en `app/api/*` con `service_role`. El cliente del navegador nunca toca la `service_role_key`. Lectura pública (anon) se limita a catálogos.
3. **Estados de reserva:** `pendiente | pagada | cancelada | expirada` (no `reservado/finalizado`). El admin filtra y muestra esto literal.
4. **Pagos** son **simulados** (`pagos.simulated = true`): `metodo_pago` ∈ `yape|plin|tarjeta`, `estado='exitoso'` al confirmar. El admin solo consulta — no genera vouchers ni emite. Lectura de `voucher_url`, `voucher_serie`, `voucher_correlativo`, `comprobante_yape_url` ya existentes.
5. **Cancelación admin-side:** el admin puede cancelar cualquier reserva pagada/pendiente sin la restricción de >24h del cliente. La regla de >24h aplica solo al user en `/mis-reservas`.
6. **DNI** en `usuarios` es nullable. El admin lo muestra readonly; no lo edita.
7. **Notificaciones in-app** (tabla `notificaciones`): el admin puede escribir aquí para mensajes a usuarios. El cliente solo lee.
8. **Historial:** `historial_reservas` se llena por **trigger** en cada cambio de `reservas`. El admin lo lee, nunca lo escribe.

## Páginas (admin)

- `/login`, `/register` — solo accesible para crear/login de admins (registro idealmente sembrado, no público)
- `/dashboard` — KPIs (usuarios, reservas, ingresos, pendientes) + gráficos (reservas/día, ingresos, distribución por deporte, últimos eventos)
- `/espacios` — CRUD de `campus` y `canchas_deportivas` (tabs)
- `/reservaciones` — tabla filtrable + panel detalle + acciones (cancelar, marcar finalizada → ojo: ver punto 3)
- `/horarios` — calendario semanal con `cancha_disponibilidad` + bloqueos
- `/precios` — CRUD de `tarifas` + `tarifas_canchasdep` (asignación masiva)
- `/reportes` — ingresos por período, comparativas, transacciones
- `/configuracion` — perfil del admin + gestión de otros admins

## Endpoints API actuales (en `app/api/`)

```
POST   /api/auth/login         (proxy hacia microservicio Java)
POST   /api/auth/register
POST   /api/auth/refresh
GET    /api/auth/verify
GET    /api/campus
POST   /api/campus
GET    /api/campus/[id]
PATCH  /api/campus/[id]
DELETE /api/campus/[id]
GET    /api/courts             (= canchas_deportivas)
POST   /api/courts
GET    /api/courts/[id]
PATCH  /api/courts/[id]
DELETE /api/courts/[id]
GET    /api/reservations
GET    /api/reservations/[id]
PATCH  /api/reservations/[id]  (cancelar)
GET    /api/pricing            (= tarifas + tarifas_canchasdep)
POST   /api/pricing
GET    /api/pricing/[id]
PATCH  /api/pricing/[id]
DELETE /api/pricing/[id]
GET    /api/schedules          (= cancha_disponibilidad)
GET    /api/payments
GET    /api/payments/[id]
GET    /api/reports
GET    /api/notifications
POST   /api/notifications
GET    /api/notifications/[id]
GET    /api/notifications/stream  (SSE)
```

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=                # MISMA que el cliente
NEXT_PUBLIC_SUPABASE_ANON_KEY=           # MISMA que el cliente
SUPABASE_SERVICE_ROLE_KEY=               # MISMA que el cliente (solo en server)
NEXT_PUBLIC_AUTH_SERVICE_URL=            # http(s)://host del microservicio Java
NEXT_PUBLIC_AUTH_SERVICE_BASE_PATH=      # default /api/v1/auth
```

## Esquema BD (Supabase) — fuente de verdad

Tablas reales: `roles`, `usuarios`, `campus`, `canchas_deportivas`, `cancha_disponibilidad`, `tarifas`, `tarifas_canchasdep`, `reservas`, `pagos`, `notificaciones`, `historial_reservas`.

Diferencias clave respecto al `types/database.ts` original del admin (ya corregido):
- `usuarios`: `clave_hash` (no `clave`); `rol_id` FK a `roles` (no `rol` string libre); `dni varchar(8) UNIQUE` **nullable**.
- `roles`: tabla propia (`id`, `nombre` con `cliente|admin`).
- `reservas.estado` ∈ `pendiente|pagada|cancelada|expirada`; tiene `code` y `expires_at`; constraint `EXCLUDE` anti-solapes.
- `pagos`: `metodo_pago` ∈ `yape|plin|tarjeta`; `estado` ∈ `pendiente|exitoso|fallido|reembolsado`; campos extra `voucher_url`, `voucher_serie`, `voucher_correlativo`, `comprobante_yape_url`, `titular_nombre`, `titular_dni`, `titular_direccion`, `titular_fecha_nacimiento`; `simulated boolean`.
- `historial_reservas`: poblado por trigger.
- Storage: `vouchers` (público), `yape_comprobantes` (privado, firma con `service_role`).
- RLS: anon solo cataloga; el admin opera vía Route Handlers con `service_role`.

SQL completo en el spec del cliente.

## Fuera de alcance

- Emisión de vouchers (lo hace el cliente al pagar; el admin solo consulta).
- Pago real / OSE / pasarela real.
- Tests automatizados (validación manual).

## Deuda técnica conocida

1. `types/database.ts` desalineado con schema real → **corregido**.
2. `services/reservations-service.ts` y `payments-service.ts` usaban estados/campos antiguos (`reservado/finalizado/completado`, `receipt_url`) → **corregido a los reales** (`pendiente/pagada/cancelada/expirada`, `voucher_url`, `metodo_pago` ∈ yape/plin/tarjeta, `pagos.estado='exitoso'`).
3. Tokens en `lib/tokens.ts`: siguen en `localStorage` + cookie, ahora con `Secure; SameSite=Lax`. **HttpOnly real no es posible desde `document.cookie`**; requeriría un Route Handler proxy que reemita las cookies del servicio Java — fuera de alcance ahora porque tocaría el flujo de auth.
4. RLS de Supabase: verificar que `service_role` solo se use server-side y que anon no acceda a `pagos`/`reservas`/`usuarios`.
