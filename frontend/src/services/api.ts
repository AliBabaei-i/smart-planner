// ═══════════════════════════════════════════════
// ✅ API Client — fetch wrapper (Offline & Server-Down Aware)
// ═══════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ✅ Token Management
const getAccessToken = (): string | null => {
  try {
    return localStorage.getItem('smart-planner-access-token')
  } catch {
    return null
  }
}

const setAccessToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem('smart-planner-access-token', token)
    } else {
      localStorage.removeItem('smart-planner-access-token')
    }
  } catch (error) {
    console.error('Failed to save token:', error)
  }
}

const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem('smart-planner-refresh-token')
  } catch {
    return null
  }
}

const setRefreshToken = (token: string | null): void => {
  try {
    if (token) {
      localStorage.setItem('smart-planner-refresh-token', token)
    } else {
      localStorage.removeItem('smart-planner-refresh-token')
    }
  } catch (error) {
    console.error('Failed to save refresh token:', error)
  }
}

const clearTokens = (): void => {
  setAccessToken(null)
  setRefreshToken(null)
}

// ✅ Force logout
let isLoggingOut = false

const forceLogout = (reason: string = 'Session expired'): void => {
  if (isLoggingOut) return
  isLoggingOut = true

  console.warn(`🚪 Force logout: ${reason}`)

  try {
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    console.error('Logout cleanup error:', e)
  }

  setTimeout(() => {
    window.location.href = '/login'
    window.location.reload()
  }, 100)
}

// ✅ FIX: متغیرهای تشخیص سرور خاموش
let isServerDown = false
let serverDownTimeout: ReturnType<typeof setTimeout> | null = null

export interface ApiRequestOptions extends RequestInit {
  _retry?: boolean
  body?: any
}

let isRefreshing = false
let refreshPromise: Promise<string> | null = null

const request = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
  
  // ✅ FIX 1: چک کردن اینترنت (اگر کاربر آفلاین باشد)
  if (!navigator.onLine) {
    const offlineError: any = new Error('شما آفلاین هستید (Offline)')
    offlineError.status = 0
    offlineError.isOfflineError = true
    throw offlineError
  }

  // ✅ FIX 2: چک کردن وضعیت سرور (اگر سرور اخیراً خاموش بوده)
  if (isServerDown) {
    const serverDownError: any = new Error('سرور در دسترس نیست (Server Down)')
    serverDownError.status = 0
    serverDownError.isServerDownError = true
    throw serverDownError
  }

  const url = `${API_URL}${endpoint}`
  const accessToken = getAccessToken()

  const config: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers
    } as HeadersInit,
    ...(options.body ? { body: JSON.stringify(options.body) } : {})
  }

  try {
    const response = await fetch(url, config)

    // ✅ FIX 3: اگر پاسخ موفق بود، پرچم سرور خاموش را پاک کن
    if (isServerDown) {
      isServerDown = false
      if (serverDownTimeout) {
        clearTimeout(serverDownTimeout)
        serverDownTimeout = null
      }
    }

    // ✅ 401 handling (توکن منقضی شده)
    if (response.status === 401 && !options._retry) {
      let errorData: any = null
      try {
        errorData = await response.clone().json()
      } catch { /* silent */ }

      if (errorData?.code === 'SESSION_INVALIDATED') {
        forceLogout('Session invalidated on another device')
        throw new Error('Session invalidated')
      }

      const refreshToken = getRefreshToken()

      if (refreshToken && !isRefreshing) {
        isRefreshing = true
        refreshPromise = fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        })
          .then(async (refreshRes) => {
            if (refreshRes.ok) {
              const data = await refreshRes.json()
              setAccessToken(data.accessToken)
              return data.accessToken as string
            }
            throw new Error('Refresh failed')
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })

        try {
          await refreshPromise
          return request<T>(endpoint, { ...options, _retry: true })
        } catch {
          forceLogout('Refresh failed')
          throw new Error('Session expired. Please login again.')
        }
      } else if (isRefreshing) {
        try {
          await refreshPromise
          return request<T>(endpoint, { ...options, _retry: true })
        } catch {
          forceLogout('Refresh failed (queued)')
          throw new Error('Session expired. Please login again.')
        }
      } else {
        forceLogout('No refresh token')
        throw new Error('Session expired. Please login again.')
      }
    }

    const contentType = response.headers.get('content-type')
    const data: any = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const error: any = new Error(data?.message || data?.error || `HTTP ${response.status}`)
      error.status = response.status
      error.data = data
      error.code = data?.code
      throw error
    }

    return data as T
  } catch (error: any) {
    // ✅ FIX 4: اگر خطای شبکه (سرور خاموش یا قطع اینترنت) بود
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      isServerDown = true
      
      // بعد از ۱۰ ثانیه، پرچم را بردار تا دوباره تلاش کند
      if (serverDownTimeout) clearTimeout(serverDownTimeout)
      serverDownTimeout = setTimeout(() => {
        isServerDown = false
        serverDownTimeout = null
      }, 10000)

      const netError: any = new Error('عدم اتصال به سرور')
      netError.status = 0
      netError.isNetworkError = true
      throw netError
    }
    throw error
  }
}

// ✅ API Client
export const api = {
  get: <T = any>(endpoint: string, options: ApiRequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options: ApiRequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options: ApiRequestOptions = {}) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  forceLogout
}

export default api