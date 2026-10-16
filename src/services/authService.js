import { api } from './api'

// ═══════════════════════════════════════════════
// ✅ Auth Service
// ═══════════════════════════════════════════════
export const authService = {
  // ✅ ثبت‌نام
  async signUp({ email, password, name }) {
    try {
      const data = await api.post('/auth/signup', { email, password, name })
      
      if (data.accessToken) api.setAccessToken(data.accessToken)
      if (data.refreshToken) api.setRefreshToken(data.refreshToken)
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // ✅ ورود
  async signIn({ email, password }) {
    try {
      const data = await api.post('/auth/signin', { email, password })
      
      if (data.accessToken) api.setAccessToken(data.accessToken)
      if (data.refreshToken) api.setRefreshToken(data.refreshToken)
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error.message }
    }
  },

  // ✅ خروج
  async signOut() {
    try {
      await api.post('/auth/signout')
    } catch (error) {
      // حتی اگه fail شد، tokens رو پاک کن
    } finally {
      api.clearTokens()
    }
    return { error: null }
  },

  // ✅ کاربر فعلی
  async getCurrentUser() {
    try {
      const data = await api.get('/auth/me')
      return { user: data.user, error: null }
    } catch (error) {
      return { user: null, error: error.message }
    }
  },

  // ✅ چک session
  async checkAuth() {
    const token = api.getAccessToken()
    
    if (!token) {
      return { user: null, error: null }
    }
    
    const { user, error } = await this.getCurrentUser()
    
    if (error) {
      api.clearTokens()
      return { user: null, error }
    }
    
    return { user, error: null }
  }
}

export default authService