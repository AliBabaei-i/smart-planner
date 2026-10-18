export interface User {
  id: string
  email: string
  name: string
  settings?: Record<string, any>
  created_at?: string
  last_login_at?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}