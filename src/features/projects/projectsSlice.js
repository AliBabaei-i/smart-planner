import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  projects: [],
  loading: false,
  error: null,
  currentProject: null
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action) => {
      const newProject = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        color: action.payload.color || '#3b82f6',
        icon: action.payload.icon || 'folder',
        budget: action.payload.budget 
          ? parseFloat(action.payload.budget) 
          : null,
        budgetCurrency: action.payload.budgetCurrency || 'IRR',
        budgetPeriod: action.payload.budgetPeriod || 'total',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.projects.push(newProject)
    },

    updateProject: (state, action) => {
      const index = state.projects.findIndex(project => project.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
      }
    },

    deleteProject: (state, action) => {
      state.projects = state.projects.filter(project => project.id !== action.payload)
    },

    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
    }
  },

  // ═══════════════════════════════════════════════
  // ✅ Extra Reducers — برای Sync
  // ═══════════════════════════════════════════════
  extraReducers: (builder) => {
    // ✅ Merge projects از سرور
    builder.addCase('sync/mergeProjects', (state, action) => {
      const remoteItems = action.payload?.items || []

      for (const remote of remoteItems) {
        // ✅ اگه deleted_at داره → حذف کن
        if (remote.deletedAt || remote.deleted_at) {
          state.projects = state.projects.filter(p => p.id !== remote.id)
          continue
        }

        const index = state.projects.findIndex(p => p.id === remote.id)

        if (index === -1) {
          // ✅ پروژه جدید از سرور
          state.projects.push(remote)
        } else {
          // ✅ پروژه موجود → Last-Write-Wins
          const local = state.projects[index]
          const localTime = new Date(local.updatedAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || 0).getTime()

          if (remoteTime > localTime) {
            state.projects[index] = { ...local, ...remote }
          }
        }
      }
    })
  }
})

export const {
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading,
  setError
} = projectsSlice.actions

export default projectsSlice.reducer