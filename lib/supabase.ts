import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '' 

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Esto crea la conexión real con la base de datos de tu amigo
export const supabase = createClient(supabaseUrl, supabaseAnonKey)