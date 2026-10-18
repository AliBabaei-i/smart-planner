import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import type { Project, ProjectsState } from '../../types/projects'

const initialState: ProjectsState = {
  projects: [],
  loading: false,
  error: null,
  currentProject: null,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    addProject: (state, action: PayloadAction<Partial<Project> & { name: string }>) => {
      const newProject: Project = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        color: action.payload.color || '#3b82f6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      state.projects.push(newProject)
    },
    updateProject: (state, action: PayloadAction<Partial<Project> & { id: string }>) => {
      const index = state.projects.findIndex(p => p.id === action.payload.id)
      if (index !== -1) {
        state.projects[index] = {
          ...state.projects[index],
          ...action.payload,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter(p => p.id !== action.payload)
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeProjects', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.projects = state.projects.filter(p => p.id !== remote.id)
          continue
        }
        const index = state.projects.findIndex(p => p.id === remote.id)
        if (index === -1) {
          state.projects.push(remote)
        } else {
          const local = state.projects[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()
          if (remoteTime > localTime) {
            state.projects[index] = { ...local, ...remote }
          }
        }
      }
    })
  },
})

export const { addProject, updateProject, deleteProject, setCurrentProject } = projectsSlice.actions
export default projectsSlice.reducer