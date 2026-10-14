import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import projectsReducer from '../features/projects/projectsSlice'
import tasksReducer from '../features/tasks/tasksSlice'
import habitsReducer from '../features/habits/habitsSlice'
import notesReducer from '../features/notes/notesSlice'
import goalsReducer from '../features/goals/goalsSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import themeReducer from '../features/theme/themeSlice'
import pomodoroReducer from '../features/pomodoro/pomodoroSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import achievementsReducer from '../features/achievements/achievementsSlice'
import growthReducer from '../features/growth/growthSlice'
import financeReducer from '../features/finance/financeSlice'

// ✅ middleware برای ذخیره‌سازی خودکار در Local Storage
const persistenceMiddleware = (store) => (next) => (action) => {
  const result = next(action)
  const state = store.getState()

  try {
    if (state.projects) {
      localStorage.setItem('smart-planner-projects', JSON.stringify(state.projects))
    }
    if (state.tasks) {
      localStorage.setItem('smart-planner-tasks', JSON.stringify(state.tasks))
    }
    if (state.habits) {
      localStorage.setItem('smart-planner-habits', JSON.stringify({
        habits: state.habits.habits,
        completions: state.habits.completions
      }))
    }
    if (state.notes) {
      localStorage.setItem('smart-planner-notes', JSON.stringify({
        notes: state.notes.notes
      }))
    }
    if (state.goals) {
      localStorage.setItem('smart-planner-goals', JSON.stringify({
        goals: state.goals.goals
      }))
    }
    if (state.notifications) {
      localStorage.setItem('smart-planner-notifications', JSON.stringify(state.notifications))
    }
    if (state.theme) {
      localStorage.setItem('smart-planner-theme', JSON.stringify(state.theme))
    }
    if (state.growth) {
      localStorage.setItem('smart-planner-growth', JSON.stringify({
        journals: state.growth.journals,
        skills: state.growth.skills
      }))
    }
    if (state.finance) {
  localStorage.setItem('smart-planner-finance', JSON.stringify(state.finance))
}
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }

  return result
}

// ✅ بارگذاری state از Local Storage
const loadStateFromStorage = () => {
  try {
    const projects = JSON.parse(localStorage.getItem('smart-planner-projects'))
    const tasks = JSON.parse(localStorage.getItem('smart-planner-tasks'))
    const habits = JSON.parse(localStorage.getItem('smart-planner-habits'))
    const notes = JSON.parse(localStorage.getItem('smart-planner-notes'))
    const goals = JSON.parse(localStorage.getItem('smart-planner-goals'))
    const notifications = JSON.parse(localStorage.getItem('smart-planner-notifications'))
    const theme = JSON.parse(localStorage.getItem('smart-planner-theme'))
const growth = JSON.parse(localStorage.getItem('smart-planner-growth'))
    return {
      projects: projects || { projects: [], loading: false, error: null },
      tasks: tasks || { tasks: [], availableTags: [], loading: false, error: null },
      habits: habits || { habits: [], completions: {} },
      notes: notes || { notes: [] },
      goals: goals || { goals: [] },
      growth: growth || { journals: [], skills: [] },
      notifications: notifications || { notifications: [], settings: {} },
      theme: theme || {
        mode: 'light',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444'
        },
        settings: {
          reducedMotion: false,
          highContrast: false,
          largeText: false
        }
      }
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return {}
  }
}

const preloadedState = loadStateFromStorage()

if (preloadedState.theme && preloadedState.theme.mode) {
  document.documentElement.classList.toggle('dark', preloadedState.theme.mode === 'dark')
}

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectsReducer,
    tasks: tasksReducer,
    habits: habitsReducer,
    notes: notesReducer,
    goals: goalsReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    pomodoro: pomodoroReducer,
    dashboard: dashboardReducer,
    achievements: achievementsReducer,
    growth: growthReducer,finance: financeReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(persistenceMiddleware),
})

export default store