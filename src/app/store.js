import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import projectsReducer from '../features/projects/projectsSlice'
import tasksReducer from '../features/tasks/tasksSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import themeReducer from '../features/theme/themeSlice'
import pomodoroReducer from '../features/pomodoro/pomodoroSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import achievementsReducer from '../features/achievements/achievementsSlice'
import habitsReducer from '../features/habits/habitsSlice'
import notesReducer from '../features/notes/notesSlice'
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
    if (state.notifications) {
      localStorage.setItem('smart-planner-notifications', JSON.stringify(state.notifications))
    }
    if (state.theme) {
      localStorage.setItem('smart-planner-theme', JSON.stringify(state.theme))
    } if (state.habits) {
      localStorage.setItem('smart-planner-habits', JSON.stringify({
        habits: state.habits.habits,
        completions: state.habits.completions
      }))
    }
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }

  return result
}

const loadStateFromStorage = () => {
  try {
    const projects = JSON.parse(localStorage.getItem('smart-planner-projects'))
    const tasks = JSON.parse(localStorage.getItem('smart-planner-tasks'))
    const notifications = JSON.parse(localStorage.getItem('smart-planner-notifications'))
    const theme = JSON.parse(localStorage.getItem('smart-planner-theme'))
    const habits = JSON.parse(localStorage.getItem('smart-planner-habits'))
    return {
      projects: projects || { projects: [], loading: false, error: null },
      habits: habits || { habits: [], completions: {} },
      tasks: tasks || { tasks: [], availableTags: [], loading: false, error: null },
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
    notifications: notificationsReducer,
    theme: themeReducer,
    pomodoro: pomodoroReducer,
    dashboard: dashboardReducer,
    achievements: achievementsReducer, habits: habitsReducer, notes: notesReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    }).concat(persistenceMiddleware),
})

export default store