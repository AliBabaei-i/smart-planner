import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface Milestone {
  id: string
  title: string
  completed: boolean
}

export interface Goal {
  id: string
  title: string
  description: string
  category: string
  status: string
  color: string
  startDate: string | null
  targetDate: string | null
  milestones: Milestone[]
  archived: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface GoalsState {
  goals: Goal[]
}

// ✅ ثابت‌های Goals
export const GOAL_CATEGORIES = [
  { id: 'personal', name: 'شخصی' },
  { id: 'career', name: 'شغلی' },
  { id: 'health', name: 'سلامتی' },
  { id: 'financial', name: 'مالی' },
  { id: 'learning', name: 'یادگیری' },
  { id: 'relationships', name: 'روابط' }
] as const

export const GOAL_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'
] as const

const initialState: GoalsState = { goals: [] }

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    addGoal: (state, action: PayloadAction<Partial<Goal> & { title: string }>) => {
      state.goals.push({
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description || '',
        category: action.payload.category || 'personal',
        status: action.payload.status || 'active',
        color: action.payload.color || '#3b82f6',
        startDate: action.payload.startDate || null,
        targetDate: action.payload.targetDate || null,
        milestones: action.payload.milestones || [],
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateGoal: (state, action: PayloadAction<Partial<Goal> & { id: string }>) => {
      const idx = state.goals.findIndex(g => g.id === action.payload.id)
      if (idx !== -1) state.goals[idx] = { ...state.goals[idx], ...action.payload, updatedAt: new Date().toISOString() }
    },
    deleteGoal: (state, action: PayloadAction<string>) => {
      state.goals = state.goals.filter(g => g.id !== action.payload)
    },
    toggleArchiveGoal: (state, action: PayloadAction<string>) => {
      const goal = state.goals.find(g => g.id === action.payload)
      if (goal) { goal.archived = !goal.archived; goal.updatedAt = new Date().toISOString() }
    },
    addMilestone: (state, action: PayloadAction<{ goalId: string; title: string }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) {
        goal.milestones.push({ id: uuidv4(), title: action.payload.title, completed: false })
        goal.updatedAt = new Date().toISOString()
      }
    },
    updateMilestone: (state, action: PayloadAction<{ goalId: string; milestoneId: string; title: string }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) {
        const m = goal.milestones.find(m => m.id === action.payload.milestoneId)
        if (m) { m.title = action.payload.title; goal.updatedAt = new Date().toISOString() }
      }
    },
    deleteMilestone: (state, action: PayloadAction<{ goalId: string; milestoneId: string }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) {
        goal.milestones = goal.milestones.filter(m => m.id !== action.payload.milestoneId)
        goal.updatedAt = new Date().toISOString()
      }
    },
    toggleMilestone: (state, action: PayloadAction<{ goalId: string; milestoneId: string }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) {
        const m = goal.milestones.find(m => m.id === action.payload.milestoneId)
        if (m) { m.completed = !m.completed; goal.updatedAt = new Date().toISOString() }
      }
    },
    setGoalStatus: (state, action: PayloadAction<{ goalId: string; status: string }>) => {
      const goal = state.goals.find(g => g.id === action.payload.goalId)
      if (goal) { goal.status = action.payload.status; goal.updatedAt = new Date().toISOString() }
    }
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeGoals', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) { state.goals = state.goals.filter(g => g.id !== remote.id); continue }
        const idx = state.goals.findIndex(g => g.id === remote.id)
        if (idx === -1) state.goals.push(remote)
        else if (new Date(remote.updatedAt || 0) > new Date(state.goals[idx].updatedAt || 0)) state.goals[idx] = { ...state.goals[idx], ...remote }
      }
    })
  }
})

export const { addGoal, updateGoal, deleteGoal, toggleArchiveGoal, addMilestone, updateMilestone, deleteMilestone, toggleMilestone, setGoalStatus } = goalsSlice.actions
export default goalsSlice.reducer