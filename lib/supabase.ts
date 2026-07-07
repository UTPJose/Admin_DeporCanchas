import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Check .env.local for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )
}

if (!supabaseServiceRoleKey && typeof window === 'undefined') {
  console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Server-side queries may be restricted by RLS.')
}

// Server-side client con service_role (bypassa RLS). Todos los services y
// Route Handlers usan este cliente — el anon nunca debe usarse para
// lectura/escritura desde el admin (rompe por RLS, ver CLAUDE.md).
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey || supabaseAnonKey)

