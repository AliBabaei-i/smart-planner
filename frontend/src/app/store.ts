import { configureStore, combineReducers } from '@reduxjs/toolkit'
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  createMigrate, 
} from 'redux-persist'
import persistStorage from './persistStorage'
import { migrations } from './migrations'

// ✅ همه‌ی Slices (اکثرا .ts شدن)
import authReducer from '../features/auth/authSlice'
import tasksReducer from '../features/tasks/tasksSlice'
import projectsReducer from '../features/projects/projectsSlice'
import habitsReducer from '../features/habits/habitsSlice'
import notesReducer from '../features/notes/notesSlice'
import goalsReducer from '../features/goals/goalsSlice'
import growthReducer from '../features/growth/growthSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import achievementsReducer from '../features/achievements/achievementsSlice'
import pomodoroReducer from '../features/pomodoro/pomodoroSlice'
import themeReducer from '../features/theme/themeSlice'
import notificationsReducer from '../features/notifications/notificationsSlice'
import financeReducer from '../features/finance/financeSlice'
import syncReducer from '../features/sync/syncSlice'

import { syncMiddleware } from '../services/syncMiddleware'

const rootReducer = combineReducers({
  auth: authReducer,
  tasks: tasksReducer,
  projects: projectsReducer,
  habits: habitsReducer,
  notes: notesReducer,
  goals: goalsReducer,
  growth: growthReducer,
  dashboard: dashboardReducer,
  achievements: achievementsReducer,
  pomodoro: pomodoroReducer,
  theme: themeReducer,
  notifications: notificationsReducer,
  finance: financeReducer,
  sync: syncReducer,
})

const persistConfig = {
  key: 'persist:smart-planner',
  version: 5,
  storage: persistStorage,
  whitelist: [
    'auth', 'tasks', 'sync', 'projects', 'habits', 'notes',
    'goals', 'growth', 'dashboard', 'achievements',
    'theme', 'notifications', 'finance',
  ],
  blacklist: ['pomodoro'],
  migrate: createMigrate(migrations, { debug: import.meta.env.DEV }),
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(syncMiddleware),
  devTools: import.meta.env.MODE !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store