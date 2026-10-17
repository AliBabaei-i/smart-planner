import { api } from './api'

export interface User {
  id: string
  email: string
  name: string
  settings?: Record<string, any>
  created_at?: string
  last_login_at?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const authService = {
  async signUp({ email, password, name }: { email: string; password: string; name?: string }): Promise<{ data: AuthResponse | null; error: string | null }> {
    try {
      const data = await api.post<AuthResponse>('/auth/signup', { email, password, name })
      if (data.accessToken) api.setAccessToken(data.accessToken)
      if (data.refreshToken) api.setRefreshToken(data.refreshToken)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async signIn({ email, password }: { email: string; password: string }): Promise<{ data: AuthResponse | null; error: string | null }> {
    try {
      const data = await api.post<AuthResponse>('/auth/signin', { email, password })
      if (data.accessToken) api.setAccessToken(data.accessToken)
      if (data.refreshToken) api.setRefreshToken(data.refreshToken)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await api.post('/auth/signout')
    } catch (error) {
      // silent
    } finally {
      api.clearTokens()
    }
    return { error: null }
  },

  async getCurrentUser(): Promise<{ user: User | null; error: string | null }> {
    try {
      const data = await api.get<{ user: User }>('/auth/me')
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error.message }
    }
  },

  async checkAuth(): Promise<{ user: User | null; error: string | null }> {
    const token = api.getAccessToken()
    if (!token) return { user: null, error: null }

    const { user, error } = await this.getCurrentUser()
    if (error) {
      api.clearTokens()
      return { user: null, error }
    }
    return { user, error: null }
  }
}

export default authService