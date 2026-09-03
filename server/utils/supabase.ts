import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serverSupabaseInstance: SupabaseClient | null = null

export const useServerSupabase = () => {
  const config = useRuntimeConfig()
  
  if (!serverSupabaseInstance) {
    const url = config.public.supabaseUrl || process.env.SUPABASE_URL || 'https://placeholder.supabase.co'
    const key = config.supabaseServiceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY || config.public.supabaseAnonKey || process.env.SUPABASE_ANON_KEY || 'placeholder-key'
    
    serverSupabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  }

  return serverSupabaseInstance
}
