import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService, type User } from '../../services/authService'

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// ✅ نام‌گذاری‌ها اصلاح شدند تا با LoginPage.jsx هماهنگ باشند
export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    const { data, error } = await authService.signIn({ email, password })
    if (error) return rejectWithValue(error)
    return data!
  }
)

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }: { email: string; password: string; name: string }, { rejectWithValue }) => {
    const { data, error } = await authService.signUp({ email, password, name })
    if (error) return rejectWithValue(error)
    return data!
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    const { user, error } = await authService.checkAuth()
    if (error) return rejectWithValue(error)
    return user
  }
)

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: (state) => {
      authService.signOut()
      state.user = null
      state.isAuthenticated = false
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder.addCase(signInUser.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(signInUser.fulfilled, (state, action) => {
      state.loading = false; state.isAuthenticated = true; state.user = action.payload.user
    })
    builder.addCase(signInUser.rejected, (state, action) => {
      state.loading = false; state.error = action.payload as string
    })

    builder.addCase(signUpUser.pending, (state) => { state.loading = true; state.error = null })
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.loading = false; state.isAuthenticated = true; state.user = action.payload.user
    })
    builder.addCase(signUpUser.rejected, (state, action) => {
      state.loading = false; state.error = action.payload as string
    })

    builder.addCase(checkAuth.pending, (state) => { state.loading = true })
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.loading = false
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    })
    builder.addCase(checkAuth.rejected, (state) => {
      state.loading = false; state.user = null; state.isAuthenticated = false
    })
  }
})

export const { signOut, clearError } = authSlice.actions

// ✅ سلکتورهایی که ProtectedRoute.jsx بهشون نیاز داره
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectIsCheckingAuth = (state: { auth: AuthState }) => state.auth.loading && !state.auth.isAuthenticated && !state.auth.error

export default authSlice.reducer