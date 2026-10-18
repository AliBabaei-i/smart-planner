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
      localStorage.setItem('smart-planner-last-user-id', data.user.id)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async signIn({ email, password }: { email: string; password: string }): Promise<{ data: AuthResponse | null; error: string | null }> {
    try {
      const data = await api.post<AuthResponse>('/auth/signin', { email, password })

      // ✅ چک: کاربر جدید با کاربر قبلی فرق داره؟
      const previousUserId = localStorage.getItem('smart-planner-last-user-id')
      if (previousUserId && previousUserId !== data.user.id) {
        // ⚠️ کاربر عوض شده ولی logout انجام نشده → پاکسازی فوری
        console.warn('🚨 User switched without logout — purging all data')
        await this.purgeAllData()
      }

      if (data.accessToken) api.setAccessToken(data.accessToken)
      if (data.refreshToken) api.setRefreshToken(data.refreshToken)
      localStorage.setItem('smart-planner-last-user-id', data.user.id)
      return { data, error: null }
    } catch (error: any) {
      return { data: null, error: error.message }
    }
  },

  async signOut(): Promise<{ error: string | null }> {
    try {
      await api.post('/auth/signout')
    } catch (error) {
      // اگه endpoint هم نبود، مهم نیست
    } finally {
      await this.purgeAllData()
    }
    return { error: null }
  },

  // ✅ پاکسازی کامل: توکن‌ها + IndexedDB + localStorage
  async purgeAllData(): Promise<void> {
    try {
      api.clearTokens()
    } catch {}

    // ✅ پاک کردن IndexedDB (redux-persist)
    try {
      const { persistor } = await import('../app/store')
      await persistor.purge()
    } catch (e) {
      console.warn('persist purge failed:', e)
    }

    // ✅ پاک کردن sync queue (Dexie)
    try {
      const { syncQueue } = await import('./syncQueue')
      await syncQueue.clear()
    } catch (e) {
      console.warn('syncQueue clear failed:', e)
    }

    // ✅ پاک کردن localStorage markers
    try {
      localStorage.removeItem('smart-planner-last-sync')
      localStorage.removeItem('smart-planner-last-user-id')
      localStorage.removeItem('smart-planner-access-token')
      localStorage.removeItem('smart-planner-refresh-token')
    } catch {}
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
  },

  // ═══════════════════════════════════════════════
  // ✅ Forgot Password
  // ═══════════════════════════════════════════════
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email })
      return data
    } catch (error: any) {
      return { success: false, message: error.message || 'خطا در ارسال درخواست' }
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const data = await api.post<{ success: boolean; message: string }>('/auth/reset-password', { token, newPassword })
      return data
    } catch (error: any) {
      return { success: false, message: error.message || 'خطا در بازنشانی رمز' }
    }
  },
}

export default authService