import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// ✅ رنگ‌های پیش‌فرض عادت‌ها
export const HABIT_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1'
]

// ✅ آیکون‌های پیش‌فرض
export const HABIT_ICON_OPTIONS = [
  { id: 'water', Icon: 'FiDroplet', color: '#06b6d4' },
  { id: 'book', Icon: 'FiBook', color: '#3b82f6' },
  { id: 'run', Icon: 'FiActivity', color: '#10b981' },
  { id: 'meditation', Icon: 'FiFeather', color: '#8b5cf6' },
  { id: 'gym', Icon: 'FiZap', color: '#f59e0b' },
  { id: 'plant', Icon: 'FiSun', color: '#84cc16' },
  { id: 'morning', Icon: 'FiSunrise', color: '#f97316' },
  { id: 'night', Icon: 'FiMoon', color: '#6366f1' },
  { id: 'write', Icon: 'FiEdit3', color: '#ec4899' },
  { id: 'target', Icon: 'FiTarget', color: '#ef4444' }
]

// ✅ بارگذاری از localStorage
const getInitialState = () => {
  try {
    const saved = localStorage.getItem('smart-planner-habits')
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error('Error loading habits:', e)
  }
  return {
    habits: [],
    completions: {}
  }
}

// ✅ ذخیره در localStorage
const saveToStorage = (state) => {
  try {
    localStorage.setItem('smart-planner-habits', JSON.stringify({
      habits: state.habits,
      completions: state.completions
    }))
  } catch (e) {
    console.error('Error saving habits:', e)
  }
}

// ✅ محاسبه Streak فعلی
const calculateStreak = (habitId, completions) => {
  const habitCompletions = completions[habitId] || {}
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    if (habitCompletions[dateStr]) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
}

// ✅ محاسبه طولانی‌ترین Streak
const calculateLongestStreak = (habitId, completions) => {
  const habitCompletions = completions[habitId] || {}
  const dates = Object.keys(habitCompletions)
    .filter(d => habitCompletions[d])
    .sort()

  if (dates.length === 0) return 0

  let longestStreak = 1
  let currentStreak = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }

  return longestStreak
}

const habitsSlice = createSlice({
  name: 'habits',
  initialState: getInitialState(),
  reducers: {
    // ✅ افزودن عادت جدید
    addHabit: (state, action) => {
      const newHabit = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        iconId: action.payload.iconId || 'target',
        color: action.payload.color || HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)],
        frequency: action.payload.frequency || 'daily',
        targetDays: action.payload.targetDays || [0, 1, 2, 3, 4, 5, 6],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        archived: false
      }
      state.habits.push(newHabit)
      state.completions[newHabit.id] = {}
      saveToStorage(state)
    },

    // ✅ ویرایش عادت
    updateHabit: (state, action) => {
      const index = state.habits.findIndex(h => h.id === action.payload.id)
      if (index !== -1) {
        state.habits[index] = {
          ...state.habits[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
        saveToStorage(state)
      }
    },

    // ✅ حذف عادت
    deleteHabit: (state, action) => {
      state.habits = state.habits.filter(h => h.id !== action.payload)
      delete state.completions[action.payload]
      saveToStorage(state)
    },

    // ✅ آرشیو کردن عادت
    toggleArchiveHabit: (state, action) => {
      const habit = state.habits.find(h => h.id === action.payload)
      if (habit) {
        habit.archived = !habit.archived
        habit.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },

    // ✅ تیک زدن عادت در یک تاریخ
    toggleCompletion: (state, action) => {
      const { habitId, date } = action.payload
      if (!state.completions[habitId]) {
        state.completions[habitId] = {}
      }

      if (state.completions[habitId][date]) {
        delete state.completions[habitId][date]
      } else {
        state.completions[habitId][date] = true
      }

      saveToStorage(state)
    },

    // ✅ پاک کردن همه
    clearAllHabits: (state) => {
      state.habits = []
      state.completions = {}
      saveToStorage(state)
    }
  },

  // ═══════════════════════════════════════════════
  // ✅ Extra Reducers — برای Sync
  // ═══════════════════════════════════════════════
  extraReducers: (builder) => {
    builder.addCase('sync/mergeHabits', (state, action) => {
      const remoteItems = action.payload?.items || []

      for (const remote of remoteItems) {
        // ✅ حذف soft-deleted
        if (remote.deletedAt || remote.deleted_at) {
          state.habits = state.habits.filter(h => h.id !== remote.id)
          delete state.completions[remote.id]
          continue
        }

        const index = state.habits.findIndex(h => h.id === remote.id)

        // ✅ جداسازی completions از habit
        const { completions, ...habitData } = remote

        if (index === -1) {
          state.habits.push(habitData)
          state.completions[habitData.id] = completions || {}
        } else {
          const local = state.habits[index]
          const localTime = new Date(local.updatedAt || local.createdAt || 0).getTime()
          const remoteTime = new Date(remote.updatedAt || remote.createdAt || 0).getTime()

          if (remoteTime > localTime) {
            state.habits[index] = { ...local, ...habitData }
          }

          // ✅ completions رو union کن
          if (completions) {
            state.completions[habitData.id] = {
              ...(state.completions[habitData.id] || {}),
              ...completions
            }
          }
        }
      }

      saveToStorage(state)
    })
  }
})

export const {
  addHabit,
  updateHabit,
  deleteHabit,
  toggleArchiveHabit,
  toggleCompletion,
  clearAllHabits
} = habitsSlice.actions

// ✅ Export توابع کمکی
export const habitHelpers = {
  calculateStreak,
  calculateLongestStreak,
  HABIT_COLORS,
  HABIT_ICON_OPTIONS
}

export default habitsSlice.reducer