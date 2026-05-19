import { z } from 'zod'

/**
 * Common validators using Zod
 */

// Email validator
export const emailSchema = z.string().email('Email inválido').toLowerCase()

// Phone validator (Peru)
export const phoneSchema = z
  .string()
  .regex(/^\+?51?\d{9}$/, 'Teléfono inválido')
  .optional()

// Name validator
export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no debe exceder 100 caracteres')

// ID validator
export const idSchema = z.number().int().positive()

// Campus form
export const campusFormSchema = z.object({
  nombre: nameSchema,
  ubicacion: z.string().min(5, 'La ubicación es requerida'),
  estado: z.enum(['activo', 'inactivo', 'mantenimiento']),
})

export type CampusFormData = z.infer<typeof campusFormSchema>

// Court form
export const courtFormSchema = z.object({
  campus_id: idSchema,
  nombre: nameSchema,
  tipo_deporte: z.enum(['futbol', 'voley', 'basquet', 'tenis']),
  cantidad_jugadores: z.number().int().min(2).max(100),
  estado: z.enum(['disponible', 'bloqueado', 'mantenimiento']),
})

export type CourtFormData = z.infer<typeof courtFormSchema>

// Reservation form
export const reservationFormSchema = z.object({
  canchasdep_id: idSchema,
  usuarios_id: idSchema,
  fecha_empieza: z.string().datetime(),
  fecha_termina: z.string().datetime(),
  estado: z.enum(['pendiente', 'pagada', 'cancelada', 'expirada']).optional(),
  precio_total: z.number().positive(),
})

export type ReservationFormData = z.infer<typeof reservationFormSchema>

// Pricing form
export const pricingFormSchema = z.object({
  nombre: nameSchema,
  precio: z.number().positive(),
  prioridad: z.number().int().min(0).max(100),
  hora_empieza: z.string().optional(),
  hora_termina: z.string().optional(),
  fecha_empieza: z.string().optional(),
  fecha_termina: z.string().optional(),
})

export type PricingFormData = z.infer<typeof pricingFormSchema>

// Block schedule form
export const blockScheduleFormSchema = z.object({
  canchasdep_id: idSchema,
  fecha: z.string().date(),
  hora_inicio: z.string(),
  hora_fin: z.string(),
  repeticion: z.enum(['no_repetir', 'diario', 'semanal', 'mensual', 'anual']),
  repetir_cada: z.number().int().positive().optional(),
  finaliza: z.enum(['nunca', 'en_fecha', 'repeticiones']).optional(),
  fecha_fin: z.string().optional(),
  cantidad_repeticiones: z.number().int().positive().optional(),
})

export type BlockScheduleFormData = z.infer<typeof blockScheduleFormSchema>

// Profile form
export const profileFormSchema = z.object({
  nombre: nameSchema,
  email: emailSchema,
  celular: phoneSchema,
})

export type ProfileFormData = z.infer<typeof profileFormSchema>

// Change password form
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Contraseña actual requerida'),
    newPassword: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener una letra mayúscula')
      .regex(/[0-9]/, 'Debe contener un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ChangePasswordData = z.infer<typeof changePasswordSchema>

// Admin user form
export const adminUserFormSchema = z.object({
  nombre: nameSchema,
  email: emailSchema,
  usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
  estado: z.enum(['activo', 'inactivo']),
})

export type AdminUserFormData = z.infer<typeof adminUserFormSchema>
