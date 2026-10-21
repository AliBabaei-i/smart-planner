import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { authService, type User } from '../../services/authService'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  offline: boolean  // ✅ جدید: آفلاین هستیم ولی user cached داریم
}

// ═══════════════════════════════════════════════
// ✅ Helpers
// ═══════════════════════════════════════════════
const isOffline = (): boolean => {
  if (typeof navigator === 'undefined') return false
  return !navigator.onLine
}

const isNetworkError = (err: unknown): boolean => {
  if (!err) return false
  if (typeof err === 'object' && err !== null && 'name' in err) {
    if ((err as any).name === 'OfflineError') return true
  }
  const msg = String((err as any)?.message || err || '').toLowerCase()
  return (
    msg.includes('offline') ||
    msg.includes('network') ||
    msg.includes('failed to fetch') ||
    msg.includes('timeout') ||
    msg.includes('unreachable') ||
    msg.includes('econnrefused')
  )
}

// ═══════════════════════════════════════════════
// ✅ Thunks
// ═══════════════════════════════════════════════
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await authService.signIn({ email, password })
    if (error) return rejectWithValue(error)
    return data!
  }
)

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async (
    { email, password, name }: { email: string; password: string; name: string },
    { rejectWithValue }
  ) => {
    const { data, error } = await authService.signUp({ email, password, name })
    if (error) return rejectWithValue(error)
    return data!
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState }
    const cachedUser = state.auth.user

    // ✅ اگر آفلاین هستیم و user cached داریم → بدون network، همان را برگردان
    if (isOffline() && cachedUser) {
      return cachedUser
    }

    const { user, error } = await authService.checkAuth()

    if (error) {
      // ✅ خطای شبکه + user cached → کاربر را نگه دار
      if (isNetworkError(error) && cachedUser) {
        return cachedUser
      }
      return rejectWithValue(String(error))
    }

    // اگر سرور user برنگرداند ولی cached داریم، از cache استفاده کن
    if (!user && cachedUser) {
      return cachedUser
    }

    return user
  }
)

// ═══════════════════════════════════════════════
// ✅ Initial state
// ═══════════════════════════════════════════════
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  offline: false,
}

// ═══════════════════════════════════════════════
// ✅ Slice
// ═══════════════════════════════════════════════
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: (state) => {
      authService.signOut()
      state.user = null
      state.isAuthenticated = false
      state.offline = false
    },
    clearError: (state) => {
      state.error = null
    },
    setOffline: (state, action: PayloadAction<boolean>) => {
      state.offline = action.payload
    },
  },
  extraReducers: (builder) => {
    // ─── Sign In ───
    builder.addCase(signInUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(signInUser.fulfilled, (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.offline = false
    })
    builder.addCase(signInUser.rejected, (state, action) => {
      state.loading = false
      state.error = (action.payload as string) || 'login_failed'
    })

    // ─── Sign Up ───
    builder.addCase(signUpUser.pending, (state) => {
      state.loading = true
      state.error = null
    })
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.loading = false
      state.isAuthenticated = true
      state.user = action.payload.user
      state.offline = false
    })
    builder.addCase(signUpUser.rejected, (state, action) => {
      state.loading = false
      state.error = (action.payload as string) || 'signup_failed'
    })

    // ─── Check Auth ───
    builder.addCase(checkAuth.pending, (state) => {
      state.loading = true
    })
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.offline = isOffline()
    })
    // ✅ حیاتی: فقط در صورت 401/403 واقعی logout کن
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.loading = false
      const errorMsg = String(action.payload || '').toLowerCase()

      const wasNetworkError =
        isOffline() ||
        errorMsg.includes('offline') ||
        errorMsg.includes('network') ||
        errorMsg.includes('failed to fetch') ||
        errorMsg.includes('timeout')

      // ✅ کاربر قبلاً لاگین بوده و فقط شبکه قطع است → نگه دار
      if (wasNetworkError && state.user) {
        state.isAuthenticated = true
        state.offline = true
        return
      }

      // توکن منقضی یا نامعتبر → logout
      state.user = null
      state.isAuthenticated = false
      state.offline = false
    })
  },
})

export const { signOut, clearError, setOffline } = authSlice.actions

// ═══════════════════════════════════════════════
// ✅ Selectors
// ═══════════════════════════════════════════════
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsOffline = (state: { auth: AuthState }) => state.auth.offline

export default authSlice.reducer