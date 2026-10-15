import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// ✅ دسته‌بندی اهداف
export const GOAL_CATEGORIES = [
  { id: 'personal', color: '#8b5cf6' },
  { id: 'career', color: '#3b82f6' },
  { id: 'health', color: '#10b981' },
  { id: 'finance', color: '#f59e0b' },
  { id: 'learning', color: '#ec4899' }
]

// ✅ رنگ‌های پیش‌فرض
export const GOAL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1'
]

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('smart-planner-goals')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading goals:', e)
  }
  return { goals: [] }
}

const saveToStorage = (state) => {
  try {
    localStorage.setItem('smart-planner-goals', JSON.stringify({ goals: state.goals }))
  } catch (e) {
    console.error('Error saving goals:', e)
  }
}

const goalsSlice = createSlice({
  name: 'goals',
  initialState: getInitialState(),
  reducers: {
    addGoal: (state, action) => {
      const newGoal = {
        id: uuidv4(),
        title: action.payload.title,
        description: action.payload.description || '',
        category: action.payload.category || 'personal',
        color: action.payload.color || '#3b82f6',
        startDate: action.payload.startDate || new Date().toISOString().split('T')[0],
        targetDate: action.payload.targetDate || null,
        milestones: action.payload.milestones || [],
        status: 'active',
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.goals.unshift(newGoal)
      saveToStorage(state)
    },
    updateGoal: (state, action) => {
      const idx = state.goals.findIndex(g => g.id === action.payload.id)
      if (idx !== -1) {
        state.goals[idx] = {
          ...state.goals[idx],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
        saveToStorage(state)
      }
    },
    deleteGoal: (state, action) => {
      state.goals = state.goals.filter(g => g.id !== action.payload)
      saveToStorage(state)
    },
    toggleArchiveGoal: (state, action) => {
      const goal = state.goals.find(g => g.id === action.payload)
      if (goal) {
        goal.archived = !goal.archived
        goal.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    setGoalStatus: (state, action) => {
      const { id, status } = action.payload
      const goal = state.goals.find(g => g.id === id)
      if (goal) {
        goal.status = status
        goal.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    addMilestone: (state, action) => {
      const { goalId, title } = action.payload
      const goal = state.goals.find(g => g.id === goalId)
      if (goal) {
        if (!goal.milestones) goal.milestones = []
        goal.milestones.push({
          id: uuidv4(),
          title,
          completed: false,
          createdAt: new Date().toISOString()
        })
        goal.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    toggleMilestone: (state, action) => {
      const { goalId, milestoneId } = action.payload
      const goal = state.goals.find(g => g.id === goalId)
      if (goal && goal.milestones) {
        const m = goal.milestones.find(m => m.id === milestoneId)
        if (m) {
          m.completed = !m.completed
          goal.updatedAt = new Date().toISOString()
          saveToStorage(state)
        }
      }
    },
    deleteMilestone: (state, action) => {
      const { goalId, milestoneId } = action.payload
      const goal = state.goals.find(g => g.id === goalId)
      if (goal && goal.milestones) {
        goal.milestones = goal.milestones.filter(m => m.id !== milestoneId)
        goal.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    updateMilestone: (state, action) => {
      const { goalId, milestoneId, title } = action.payload
      const goal = state.goals.find(g => g.id === goalId)
      if (goal && goal.milestones) {
        const m = goal.milestones.find(m => m.id === milestoneId)
        if (m) {
          m.title = title
          goal.updatedAt = new Date().toISOString()
          saveToStorage(state)
        }
      }
    },
    clearAllGoals: (state) => {
      state.goals = []
      saveToStorage(state)
    }
  },

  // ═══════════════════════════════════════════════
  // ✅ Extra Reducers — برای Sync
  // ═══════════════════════════════════════════════
  extraReducers: (builder) => {
    builder.addCase('sync/mergeGoals', (state, action) => {
      const remoteItems = action.payload?.items || []

      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.goals = state.goals.filter(g => g.id !== remote.id)
          continue
        }

        const index = state.goals.findIndex(g => g.id === remote.id)

        if (index === -1) {
          state.goals.unshift(remote)
        } else {
          const local = state.goals[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

          if (remoteTime > localTime) {
            state.goals[index] = { ...local, ...remote }
          }
        }
      }

      saveToStorage(state)
    })
  }
})

export const {
  addGoal,
  updateGoal,
  deleteGoal,
  toggleArchiveGoal,
  setGoalStatus,
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  updateMilestone,
  clearAllGoals
} = goalsSlice.actions

export default goalsSlice.reducer