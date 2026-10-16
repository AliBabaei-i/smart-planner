import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { createMigrate } from 'redux-persist'
import { migrations, CURRENT_VERSION } from './migrations'

// ═══════════════════════════════════════════════
// ✅ Reducers
// ═══════════════════════════════════════════════
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
import authReducer from '../features/auth/authSlice'


import syncReducer from '../features/sync/syncSlice'
import { syncMiddleware } from '../services/syncMiddleware'
// ═══════════════════════════════════════════════
// ✅ Root Reducer
// ═══════════════════════════════════════════════
const rootReducer = combineReducers({
  tasks: tasksReducer,
  sync: syncReducer,  
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
  auth: authReducer,
})

// ═══════════════════════════════════════════════
// ✅ Persist Config
// ═══════════════════════════════════════════════
const persistConfig = {
  key: 'smart-planner',
  version: CURRENT_VERSION,
  storage,

  // ✅ فقط این slice ها persist بشن
  whitelist: [
    'auth',
    'tasks',
    'sync', 
    'projects',
    'habits',
    'notes',
    'goals',
    'growth',
    'dashboard',
    'achievements',
    'theme',
    'notifications',
    'finance'
  ],

  // ✅ این slice ها persist نشن (state موقت)
  blacklist: ['pomodoro'],

  // ✅ Migration
  migrate: createMigrate(migrations, { debug: false }),

  // ✅ State های غیرقابل serialize نادیده گرفته بشن
  serialize: true,

  // ✅ timeout برای rehydration
  timeout: 5000
}

// ═══════════════════════════════════════════════
// ✅ Persisted Reducer
// ═══════════════════════════════════════════════
const persistedReducer = persistReducer(persistConfig, rootReducer)

// ═══════════════════════════════════════════════
// ✅ Store
// ═══════════════════════════════════════════════
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // ✅ نادیده گرفتن actions مربوط به redux-persist
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(syncMiddleware),
  devTools: import.meta.env.DEV
})

// ═══════════════════════════════════════════════
// ✅ Persistor
// ═══════════════════════════════════════════════
export const persistor = persistStore(store)

// ✅ فقط در dev، store رو روی window بذار برای debugging
if (import.meta.env.DEV) {
  window.store = store
  window.persistor = persistor
}

export default store