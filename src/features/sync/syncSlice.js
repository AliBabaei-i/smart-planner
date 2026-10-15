import { createSlice } from '@reduxjs/toolkit'

// ═══════════════════════════════════════════════
// ✅ Sync State — برای نمایش وضعیت
// ═══════════════════════════════════════════════
const initialState = {
  status: 'idle', // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  lastSyncAt: null,
  lastError: null,
  queueSize: 0,
  isEnabled: true
}

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setSyncing: (state) => {
      state.status = 'syncing'
      state.lastError = null
    },

    setSynced: (state, action) => {
      state.status = 'synced'
      state.lastSyncAt = action.payload || new Date().toISOString()
      state.lastError = null
    },

    setSyncError: (state, action) => {
      state.status = 'error'
      state.lastError = action.payload
    },

    setOffline: (state) => {
      state.status = 'offline'
    },

    setQueueSize: (state, action) => {
      state.queueSize = action.payload
    },

    toggleSync: (state) => {
      state.isEnabled = !state.isEnabled
    }
  }
})

export const {
  setSyncing,
  setSynced,
  setSyncError,
  setOffline,
  setQueueSize,
  toggleSync
} = syncSlice.actions

// ✅ Selectors
export const selectSyncStatus = (state) => state.sync.status
export const selectLastSync = (state) => state.sync.lastSyncAt
export const selectSyncError = (state) => state.sync.lastError
export const selectQueueSize = (state) => state.sync.queueSize
export const selectSyncEnabled = (state) => state.sync.isEnabled

export default syncSlice.reducer