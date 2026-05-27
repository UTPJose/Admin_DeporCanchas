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

Next.js 16 (App Router) + React 19 + TS · Tailwind 4 · lucide-react · recharts · Supabase (misma instancia) · bcryptjs + jose · zod · react-hook-form · zustand.

## Auth (unificado con el cliente, endurecido)

- **Mismo motor que el cliente**: bcrypt (`usuarios.clave_hash`) + JWT (`jose`) sobre `usuarios`/`roles`. **Sin microservicio Java.**
- Cookie `admin_session`: `httpOnly + Secure + SameSite=Strict`, **1 día**, secret propio `ADMIN_JWT_SECRET`.
- `requireAdmin()` en cada Route Handler: valida JWT + re-consulta BD (`roles_id = admin` y `esta_activo`).
- Login **rechaza** rol ≠ admin. Rate limit 5/min por IP.
- **Sin registro público.** Primer admin sembrado (script). Admins extra se crean **solo desde Configuración** por un admin logueado (`POST /api/admins`, solo crea rol admin).
- Middleware protege `/(dashboard)/*` → sin sesión admin redirige a `/login`.
- `lib/auth/` (password, session, requireAdmin) espejo del cliente. Se eliminan `auth-service.ts`, `tokens.ts`, `api-client.ts` (capa Java) y rutas `auth/refresh`, `auth/verify`, páginas `register`/`callback`.

## Estados (real vs mostrado)

- BD real: `pendiente | pagada | cancelada | expirada`. **No se agregan estados.**
- Mostrado (derivado en `lib/estado-reserva.ts`): `pagada`+pasado → **Finalizada**; `pagada`+futuro → **Programada**; `pendiente` → **Pendiente de pago**; `cancelada` → **Cancelada**; `expirada` → **Expirada**.
- `StatusBadge` usa estos 5 (se elimina `reservado/finalizado/cancelado` y aliases legacy de `constants.ts`).
- Canchas: vocabulario único en español `activo | inactivo | mantenimiento` (se elimina `active/maintenance/inactive` y `disponible/bloqueado`).
- **Tipos de cancha**: tabla `tipos_cancha` (`valor` sin tildes = lo que se guarda en `canchas_deportivas.tipo_deporte`; `etiqueta` con tildes = display; `activo`). Gestionable desde **Espacios → Tipos de Cancha** (`/api/court-types`): crear, editar etiqueta, activar/desactivar. `valor` es **inmutable** tras crearse (cambiarlo dejaría huérfanas las canchas). El selector de `CourtModal` lista solo los activos; `lib/constants.ts` `TIPOS_CANCHA`/`tipoCanchaLabel` quedan solo como fallback de etiqueta para valores legacy.
- **Bloqueo de horarios** (`/horarios`): `reservas` con `estado='bloqueada'` (precio 0); el cliente lo ve como slot **Bloqueado**. El bloqueo se registra con `usuarios_id` = **admin logueado** que lo crea (vía `requireAdmin()` en la ruta) — nunca un cliente ni un usuario "de sistema". Cualquier admin puede crear/editar/liberar bloqueos; el cliente no participa. El **motivo** se persiste en `reservas.motivo`. En el calendario, clic en una celda bloqueada abre el modal de detalle/edición (cambiar fecha/hora/motivo, ver quién lo creó, o eliminar) — `PATCH /api/schedules` para editar, `DELETE` para liberar. Calendario y bloqueos en **hora de pared Lima** (`lib/lima-time.ts`, UTC-5), se convierten a instante UTC al guardar — admin y cliente muestran la misma hora. La ventana semanal usa `[lunes 00:00 Lima, lunes siguiente 00:00 Lima)`. No usar `getUTCHours`/`toISOString` crudos para fechas de calendario.

## Precios e imágenes

- **Precios** (`/precios`): una "regla" = fila en `tarifas` + enlace en `tarifas_canchasdep`. Tipos: **Días de la semana** (`tarifas.dias smallint[]`, 0=Dom..6=Sáb), **Días + Horas**, **Rango de fechas**. **Menor `prioridad` gana** (el cliente `calcularPrecioReserva` ordena asc y toma la primera que cumpla día+hora+fecha; precio = `precio_reemplazo ?? tarifas.precio`). Si nada matchea → **`canchas_deportivas.precio_default`** (fallback). Cálculo del cliente en **hora Lima** (día/hora/fecha), no `getHours()` crudo.
  - **Por Cancha**: reglas arrastrables (drag = prioridad, arriba gana → `POST /api/pricing/reorder {ids}`), card "Precio Default" editable (`PUT /api/courts/[id] {precio_default}`).
  - **Por Campus**: checklist + actualización masiva del default (`POST /api/pricing/default {court_ids,precio_default}`) + inyección de una regla **copiada independiente y colocada primera** en cada cancha (`POST /api/pricing {court_ids,...}`).
  - `GET /api/pricing?court_id=`, `POST` (court_id o court_ids), `PUT/DELETE /api/pricing/[id]` (id = tarifa).
- **Reportes** (`/reportes`): `GET /api/reports?type=revenue&startDate&endDate` → `getRevenueReport` devuelve `{totalRevenue, totalReservations, averageReservation, variationPercentage (vs período anterior), byDeport (etiqueta con tilde), byCourt, dailyData}`. Moneda **S/**.
- **Imágenes de cancha**: columna `canchas_deportivas.imagen_url`; subida vía `POST /api/courts/image` (multipart, service_role) al bucket público `canchas`. El cliente muestra `imagen_url` si existe, si no cae al placeholder por tipo.

## Datos / clientes Supabase

- **Todos los services usan `service_role`** (server-only, vía Route Handlers). Usar el cliente anon en services rompe lectura/escritura por RLS — fue la causa de "espacios no guarda" y del error del dashboard.

## Acciones admin

- **Cancelar** reserva `pagada`/`pendiente` sin la regla de 24h del cliente (`PATCH /api/reservations/[id]`). Se quita "Marcar finalizado".
- CRUD de `campus`, `canchas_deportivas`, `tarifas`/`tarifas_canchasdep`, `cancha_disponibilidad`.
- Crear/activar/desactivar admins (nunca borrar).
- Solo **consulta** pagos/vouchers/historial (no emite ni escribe historial — lo llena el trigger).

## Páginas

`/login` · `/dashboard` (KPIs+gráficos) · `/espacios` (campus+canchas) · `/reservaciones` (tabla+filtros+detalle) · `/horarios` (calendario+bloqueos) · `/precios` · `/reportes` · `/configuracion` (perfil + admins).

## Fixes pendientes (esta etapa)

1. **Reservaciones**: anidar `campus` en `cancha` (hoy `campus_nombre`="Unknown"); `hora` = `HH:MM` hora Lima (no ISO crudo); acciones llaman `PATCH` (hoy `PUT`/`DELETE` rotos).
2. **Estados/vocabulario**: unificar a los reales (ver arriba).
3. **Auth**: migrar de Java a bcrypt+JWT propio (ver arriba).
4. Filtros de Reservaciones: Todas · Programadas · Finalizadas · Pendientes · Canceladas · Expiradas.

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=        # misma que cliente
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # misma
SUPABASE_SERVICE_ROLE_KEY=       # misma (solo server)
ADMIN_JWT_SECRET=                # propio del admin (openssl rand -base64 32)
```

## Fuera de alcance

Emisión de vouchers (lo hace el cliente) · pasarela real / OSE · tests automatizados.
