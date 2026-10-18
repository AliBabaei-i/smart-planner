import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import { getLocalDateStr } from '../../utils/dateHelpers'

export interface Habit {
  id: string
  name: string
  description: string
  iconId: string
  color: string
  archived: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface HabitsState {
  habits: Habit[]
  completions: Record<string, Record<string, boolean>>
  loading: boolean
  error: string | null
}

const initialState: HabitsState = {
  habits: [],
  completions: {},
  loading: false,
  error: null,
}

const habitsSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    addHabit: (state, action: PayloadAction<Partial<Habit> & { name: string }>) => {
      state.habits.push({
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        iconId: action.payload.iconId || 'check',
        color: action.payload.color || '#10b981',
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateHabit: (state, action: PayloadAction<Partial<Habit> & { id: string }>) => {
      const idx = state.habits.findIndex(h => h.id === action.payload.id)
      if (idx !== -1) {
        state.habits[idx] = { ...state.habits[idx], ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteHabit: (state, action: PayloadAction<string>) => {
      state.habits = state.habits.filter(h => h.id !== action.payload)
      delete state.completions[action.payload]
    },
    toggleArchiveHabit: (state, action: PayloadAction<string>) => {
      const habit = state.habits.find(h => h.id === action.payload)
      if (habit) {
        habit.archived = !habit.archived
        habit.updatedAt = new Date().toISOString()
      }
    },
    toggleCompletion: (state, action: PayloadAction<{ habitId: string; date: string }>) => {
      const { habitId, date } = action.payload
      if (!state.completions[habitId]) {
        state.completions[habitId] = {}
      }
      if (state.completions[habitId][date]) {
        delete state.completions[habitId][date]
      } else {
        state.completions[habitId][date] = true
      }
      const habit = state.habits.find(h => h.id === habitId)
      if (habit) {
        habit.updatedAt = new Date().toISOString()
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeHabits', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) {
          state.habits = state.habits.filter(h => h.id !== remote.id)
          continue
        }
        const index = state.habits.findIndex(h => h.id === remote.id)
        if (index === -1) {
          state.habits.push(remote)
        } else {
          const local = state.habits[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()
          if (remoteTime > localTime) {
            state.habits[index] = { ...local, ...remote }
          }
        }
      }
    })
  },
})

export const {
  addHabit, updateHabit, deleteHabit, toggleArchiveHabit, toggleCompletion
} = habitsSlice.actions

// ✅ این بخش برای رفع خطای HabitsPage.jsx اضافه شد
export const habitHelpers = {
  // چک کردن اینکه عادت در یک تاریخ خاص انجام شده یا نه
  isCompleted: (completions: Record<string, Record<string, boolean>>, habitId: string, date: string = getLocalDateStr()): boolean => {
    return !!completions[habitId]?.[date]
  },

  // محاسبه تعداد کل روزهای انجام‌شده برای یک عادت
  getTotalCompletions: (completions: Record<string, Record<string, boolean>>, habitId: string): number => {
    return Object.keys(completions[habitId] || {}).length
  },

  // محاسبه استریک فعلی (روزهای متوالی)
  getCurrentStreak: (completions: Record<string, Record<string, boolean>>, habitId: string): number => {
    const habitCompletions = completions[habitId] || {}
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = getLocalDateStr(date)
      
      if (habitCompletions[dateStr]) {
        streak++
      } else if (i > 0) {
        // اگر امروز هنوز انجام نشده، روز قبل رو چک می‌کنیم
        break
      }
    }
    return streak
  },

  // محاسبه نرخ تکمیل در ۳۰ روز اخیر
  getCompletionRate: (completions: Record<string, Record<string, boolean>>, habitId: string, days: number = 30): number => {
    const habitCompletions = completions[habitId] || {}
    let completed = 0
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = getLocalDateStr(date)
      if (habitCompletions[dateStr]) {
        completed++
      }
    }
    return Math.round((completed / days) * 100)
  }
}

export default habitsSlice.reducer