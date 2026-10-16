// ═══════════════════════════════════════════════
// ✅ API Client — fetch wrapper
// ═══════════════════════════════════════════════

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// ═══════════════════════════════════════════════
// ✅ Token Management
// ═══════════════════════════════════════════════
const getAccessToken = () => {
  try {
    return localStorage.getItem('smart-planner-access-token')
  } catch {
    return null
  }
}

const setAccessToken = (token) => {
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

const getRefreshToken = () => {
  try {
    return localStorage.getItem('smart-planner-refresh-token')
  } catch {
    return null
  }
}

const setRefreshToken = (token) => {
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

const clearTokens = () => {
  setAccessToken(null)
  setRefreshToken(null)
}

// ═══════════════════════════════════════════════
// ✅ Force logout — پاک کردن همه چیز و رفتن به login
// ═══════════════════════════════════════════════
let isLoggingOut = false

const forceLogout = (reason = 'Session expired') => {
  if (isLoggingOut) return
  isLoggingOut = true

  console.warn(`🚪 Force logout: ${reason}`)

  try {
    // ✅ پاک کردن همه چیز
    localStorage.clear()
    sessionStorage.clear()
  } catch (e) {
    console.error('Logout cleanup error:', e)
  }

  // ✅ ریدایرکت به login
  setTimeout(() => {
    window.location.href = '/login'
    window.location.reload()
  }, 100)
}

// ═══════════════════════════════════════════════
// ✅ Main Request Function
// ═══════════════════════════════════════════════
let isRefreshing = false
let refreshPromise = null

const request = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  const accessToken = getAccessToken()

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers
    },
    ...(options.body && { body: JSON.stringify(options.body) })
  }

  try {
    const response = await fetch(url, config)

    // ═════════════════════════════════════════
    // ✅ 401 — تصمیم بر اساس کد خطا
    // ═════════════════════════════════════════
    if (response.status === 401 && !options._retry) {
      // ✅ ۱. اول body رو بخون تا کد خطا رو ببینیم
      let errorData = null
      try {
        errorData = await response.clone().json()
      } catch {}

      // ✅ ۲. اگه SESSION_INVALIDATED بود → logout فوری (بدون تلاش refresh)
      if (errorData?.code === 'SESSION_INVALIDATED') {
        forceLogout('Session invalidated on another device')
        throw new Error('Session invalidated')
      }

      // ✅ ۳. وگرنه، تلاش برای refresh
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
              return data.accessToken
            }
            throw new Error('Refresh failed')
          })
          .finally(() => {
            isRefreshing = false
            refreshPromise = null
          })

        try {
          await refreshPromise
          return request(endpoint, { ...options, _retry: true })
        } catch {
          forceLogout('Refresh failed')
          throw new Error('Session expired. Please login again.')
        }
      } else if (isRefreshing) {
        try {
          await refreshPromise
          return request(endpoint, { ...options, _retry: true })
        } catch {
          forceLogout('Refresh failed (queued)')
          throw new Error('Session expired. Please login again.')
        }
      } else {
        // ✅ refresh token نداریم → logout
        forceLogout('No refresh token')
        throw new Error('Session expired. Please login again.')
      }
    }

    // ✅ Parse response
    const contentType = response.headers.get('content-type')
    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    if (!response.ok) {
      const error = new Error(data?.message || data?.error || `HTTP ${response.status}`)
      error.status = response.status
      error.data = data
      error.code = data?.code
      throw error
    }

    return data
  } catch (error) {
    // ✅ Network error
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const netError = new Error('عدم اتصال به سرور')
      netError.status = 0
      netError.isNetworkError = true
      throw netError
    }
    throw error
  }
}

// ═══════════════════════════════════════════════
// ✅ API Client
// ═══════════════════════════════════════════════
export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'GET' }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'POST', body }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PUT', body }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, { ...options, method: 'PATCH', body }),

  delete: (endpoint, options = {}) =>
    request(endpoint, { ...options, method: 'DELETE' }),

  // ✅ Token management
  setAccessToken,
  setRefreshToken,
  getAccessToken,
  getRefreshToken,
  clearTokens,
  forceLogout
}

export default api