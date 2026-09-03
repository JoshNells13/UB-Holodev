export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
}

export interface AuthState {
  user: UserProfile | null
  loading: boolean
  isDemoUser?: boolean
}
