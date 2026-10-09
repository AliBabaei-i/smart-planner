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
    // شروع لودینگ
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    
    // افزودن پروژه جدید
    addProject: (state, action) => {
      const newProject = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        color: action.payload.color || '#3b82f6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.projects.push(newProject)
    },
    
    // حذف پروژه
    deleteProject: (state, action) => {
      state.projects = state.projects.filter(project => project.id !== action.payload)
    },
    
    // آپدیت پروژه
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
    
    // ست کردن پروژه جاری
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload
    },
    
    // ست کردن خطا
    setError: (state, action) => {
      state.error = action.payload
    }
  }
})

export const {
  setLoading,
  addProject,
  deleteProject,
  updateProject,
  setCurrentProject,
  setError
} = projectsSlice.actions

export default projectsSlice.reducer