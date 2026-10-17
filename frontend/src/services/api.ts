// ═══════════════════════════════════════════════
// ✅ API Client — fetch wrapper
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

// ✅ Request Options (اضافه کردن _retry)
export interface ApiRequestOptions extends RequestInit {
  _retry?: boolean
  body?: any
}

// ✅ Main Request Function
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

const request = async <T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
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

    // ✅ 401 handling
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
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
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