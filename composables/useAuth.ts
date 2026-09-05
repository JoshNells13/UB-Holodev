import type { UserProfile } from '~/types/auth'

export const useAuth = () => {
  const supabase = useSupabase()
  const user = useState<UserProfile | null>('auth_user', () => null)
  const isDemoUser = useState<boolean>('auth_demo_user', () => false)
  const loading = useState<boolean>('auth_loading', () => true)
  const isAuthModalOpen = useState<boolean>('auth_modal_open', () => false)
  const redirectAfterAuth = useState<string>('auth_redirect', () => '/simulate')

  const isAuthenticated = computed(() => !!user.value)

  // Sync profile to Supabase public.profiles table (both client & server route)
  const syncProfileToSupabase = async (profile: UserProfile) => {
    if (!profile.id || profile.id.startsWith('demo-')) return

    try {
      // 1. Direct Supabase client upsert
      await supabase.from('profiles').upsert({
        id: profile.id,
        full_name: profile.full_name || profile.email?.split('@')[0] || 'Petani',
        email: profile.email,
        role: profile.role || 'farmer',
        updated_at: new Date().toISOString()
      })

      // 2. Server-side guaranteed sync
      await $fetch('/api/auth/sync-profile', {
        method: 'POST',
        body: {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          role: profile.role || 'farmer'
        }
      }).catch(err => console.warn('Server sync profile notice:', err))
    } catch (e) {
      console.warn('Profile sync notice:', e)
    }
  }

  // Initialize session on client
  const initAuth = async () => {
    if (import.meta.server) return

    try {
      loading.value = true
      
      // Check Supabase session
      const { data: { session }, error } = await supabase.auth.getSession()
      if (session?.user && !error) {
        const profile: UserProfile = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Petani',
          avatar_url: session.user.user_metadata?.avatar_url || '',
          role: session.user.user_metadata?.role || 'farmer'
        }
        user.value = profile
        isDemoUser.value = false
        localStorage.removeItem('taniaman_demo_user')
        await syncProfileToSupabase(profile)
        return
      }

      // Check localStorage for demo user fallback
      const storedDemo = localStorage.getItem('taniaman_demo_user')
      if (storedDemo) {
        try {
          user.value = JSON.parse(storedDemo)
          isDemoUser.value = true
        } catch {
          localStorage.removeItem('taniaman_demo_user')
        }
      }
    } catch (e) {
      console.warn('Auth init check notice:', e)
    } finally {
      loading.value = false
    }
  }

  // Sign in with email/password
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Petani',
          avatar_url: data.user.user_metadata?.avatar_url || '',
          role: data.user.user_metadata?.role || 'farmer'
        }
        user.value = profile
        isDemoUser.value = false
        localStorage.removeItem('taniaman_demo_user')

        // Sync to public.profiles table
        await syncProfileToSupabase(profile)

        return { success: true }
      }
      return { success: false, error: 'User tidak ditemukan' }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal masuk akun' }
    } finally {
      loading.value = false
    }
  }

  // Sign up with email/password
  const signUp = async (email: string, password: string, fullName: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'farmer'
          }
        }
      })
      if (error) throw error

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || '',
          full_name: fullName || data.user.email?.split('@')[0] || 'Petani',
          avatar_url: '',
          role: 'farmer'
        }
        user.value = profile
        isDemoUser.value = false
        localStorage.removeItem('taniaman_demo_user')

        // Sync to public.profiles table
        await syncProfileToSupabase(profile)

        return { success: true }
      }
      return { success: false, error: 'Pendaftaran gagal diproses' }
    } catch (err: any) {
      return { success: false, error: err?.message || 'Gagal mendaftar' }
    } finally {
      loading.value = false
    }
  }

  // Quick Demo Login (for instant presentation / judges evaluation without waiting for email confirmations)
  const signInDemo = (name = 'Budi Santoso', email = 'petani.demo@siaptani.id') => {
    const demoUser: UserProfile = {
      id: 'demo-farmer-' + Math.random().toString(36).substring(2, 9),
      email,
      full_name: name,
      avatar_url: '',
      role: 'farmer'
    }
    user.value = demoUser
    isDemoUser.value = true
    if (import.meta.client) {
      localStorage.setItem('taniaman_demo_user', JSON.stringify(demoUser))
    }
    return { success: true }
  }

  // Sign Out
  const signOut = async () => {
    loading.value = true
    try {
      if (!isDemoUser.value) {
        await supabase.auth.signOut()
      }
    } catch (err) {
      console.warn('Sign out notice:', err)
    } finally {
      user.value = null
      isDemoUser.value = false
      if (import.meta.client) {
        localStorage.removeItem('taniaman_demo_user')
      }
      loading.value = false
      navigateTo('/')
    }
  }

  const openAuthModal = (redirectTo = '/simulate') => {
    redirectAfterAuth.value = redirectTo
    isAuthModalOpen.value = true
  }

  const closeAuthModal = () => {
    isAuthModalOpen.value = false
  }

  return {
    user,
    isAuthenticated,
    isDemoUser,
    loading,
    isAuthModalOpen,
    redirectAfterAuth,
    initAuth,
    signIn,
    signUp,
    signInDemo,
    signOut,
    openAuthModal,
    closeAuthModal,
    syncProfileToSupabase
  }
}
