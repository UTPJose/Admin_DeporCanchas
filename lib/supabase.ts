import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

// Create Supabase client - Generic typing for now, specific types will be generated from schema
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for common queries
export async function fetchCampus() {
  const { data, error } = await supabase.from('campus').select('*')
  if (error) throw error
  return data
}

export async function fetchCourts() {
  const { data, error } = await supabase.from('canchas_deportivas').select('*')
  if (error) throw error
  return data
}

export async function fetchReservations() {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, usuarios:usuarios_id(*), canchasdep:canchasdep_id(*)')
  if (error) throw error
  return data
}

export async function fetchUsers() {
  const { data, error } = await supabase.from('usuarios').select('*')
  if (error) throw error
  return data
}

export async function fetchNotifications(userId: number) {
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuarios_id', userId)
    .order('creado_en', { ascending: false })
  if (error) throw error
  return data
}

