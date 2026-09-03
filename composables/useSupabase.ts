import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  if (!supabaseInstance) {
    const url = config.public.supabaseUrl || 'https://placeholder.supabase.co'
    const anonKey = config.public.supabaseAnonKey || 'placeholder-key'
    
    supabaseInstance = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }

  return supabaseInstance
}
