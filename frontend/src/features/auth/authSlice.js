import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService } from '../../services/authService'

// ═══════════════════════════════════════════════
// ✅ Async Thunks
// ═══════════════════════════════════════════════
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, name }, { rejectWithValue }) => {
    const { data, error } = await authService.signUp({ email, password, name })
    if (error) return rejectWithValue(error)
    return data
  }
)

export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    const { data, error } = await authService.signIn({ email, password })
    if (error) return rejectWithValue(error)
    return data
  }
)

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    const { error } = await authService.signOut()
    if (error) return rejectWithValue(error)
    return null
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

// ═══════════════════════════════════════════════
// ✅ Initial State
// ═══════════════════════════════════════════════
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  initialized: false
}

// ═══════════════════════════════════════════════
// ✅ Slice
// ═══════════════════════════════════════════════
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
      state.isCheckingAuth = false
      state.initialized = true
    },
    resetAuth: () => initialState
  },
  extraReducers: (builder) => {
    // Sign Up
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Sign In
    builder
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })

    // Sign Out
    builder
      .addCase(signOutUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signOutUser.fulfilled, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
        state.error = null
      })
      .addCase(signOutUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isCheckingAuth = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isCheckingAuth = false
        state.user = action.payload
        state.isAuthenticated = !!action.payload
        state.initialized = true
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isCheckingAuth = false
        state.user = null
        state.isAuthenticated = false
        state.initialized = true
      })
  }
})

// ═══════════════════════════════════════════════
// ✅ Selectors
// ═══════════════════════════════════════════════
export const selectAuth = (state) => state.auth
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsCheckingAuth = (state) => state.auth.isCheckingAuth
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error

// ═══════════════════════════════════════════════
// ✅ Actions
// ═══════════════════════════════════════════════
export const { clearError, setUser, resetAuth } = authSlice.actions

export default authSlice.reducer