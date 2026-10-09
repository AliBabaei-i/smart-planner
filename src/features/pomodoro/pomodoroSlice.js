import { createSlice } from '@reduxjs/toolkit'

const getInitialSettings = () => {
  try {
    const saved = localStorage.getItem('smart-planner-pomodoro-settings')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading pomodoro settings:', e)
  }
  return {
    workDuration: 25,        // دقیقه
    shortBreakDuration: 5,   // دقیقه
    longBreakDuration: 15,   // دقیقه
    longBreakInterval: 4,    // هر ۴ پومودورو
    autoStartBreaks: true,
    autoStartPomodoros: false,
    soundEnabled: true,
    notificationsEnabled: true
  }
}

const getInitialStats = () => {
  try {
    const saved = localStorage.getItem('smart-planner-pomodoro-stats')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading pomodoro stats:', e)
  }
  return {
    today: {
      date: new Date().toDateString(),
      completed: 0,
      totalMinutes: 0
    },
    allTime: {
      completed: 0,
      totalMinutes: 0
    },
    history: [] // { date, count, minutes }
  }
}

const initialState = {
  // وضعیت تایمر
  mode: 'work', // 'work', 'shortBreak', 'longBreak'
  timeLeft: getInitialSettings().workDuration * 60, // ثانیه
  isRunning: false,
  completedPomodoros: 0, // در سشن فعلی
  startedAt: null,
  currentTaskId: null, // اگر به تسکی متصل است
  
  // تنظیمات و آمار
  settings: getInitialSettings(),
  stats: getInitialStats()
}

// ✅ ذخیره در localStorage
const saveStatsToStorage = (stats) => {
  try {
    localStorage.setItem('smart-planner-pomodoro-stats', JSON.stringify(stats))
  } catch (e) {
    console.error('Error saving pomodoro stats:', e)
  }
}

const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem('smart-planner-pomodoro-settings', JSON.stringify(settings))
  } catch (e) {
    console.error('Error saving pomodoro settings:', e)
  }
}

const pomodoroSlice = createSlice({
  name: 'pomodoro',
  initialState,
  reducers: {
    // ✅ شروع/توقف
    toggleTimer: (state) => {
      state.isRunning = !state.isRunning
      if (state.isRunning && !state.startedAt) {
        state.startedAt = new Date().toISOString()
      }
    },

    startTimer: (state) => {
      state.isRunning = true
      if (!state.startedAt) {
        state.startedAt = new Date().toISOString()
      }
    },

    pauseTimer: (state) => {
      state.isRunning = false
    },

    // ✅ ریست تایمر
    resetTimer: (state) => {
      state.isRunning = false
      state.startedAt = null
      if (state.mode === 'work') {
        state.timeLeft = state.settings.workDuration * 60
      } else if (state.mode === 'shortBreak') {
        state.timeLeft = state.settings.shortBreakDuration * 60
      } else {
        state.timeLeft = state.settings.longBreakDuration * 60
      }
    },

    // ✅ کاهش یک ثانیه
    tick: (state) => {
      if (state.timeLeft > 0) {
        state.timeLeft -= 1
      }
    },

    // ✅ تغییر دستی mode
    setMode: (state, action) => {
      const mode = action.payload
      state.mode = mode
      state.isRunning = false
      state.startedAt = null
      
      if (mode === 'work') {
        state.timeLeft = state.settings.workDuration * 60
      } else if (mode === 'shortBreak') {
        state.timeLeft = state.settings.shortBreakDuration * 60
      } else {
        state.timeLeft = state.settings.longBreakDuration * 60
      }
    },

    // ✅ تکمیل یک پومودورو (شروع استراحت)
    completeWork: (state) => {
      const minutes = state.settings.workDuration
      
      // آپدیت آمار
      const today = new Date().toDateString()
      
      // چک کردن امروز
      if (state.stats.today.date !== today) {
        // روز جدید شد، ذخیره در history
        if (state.stats.today.completed > 0) {
          state.stats.history.unshift({
            date: state.stats.today.date,
            count: state.stats.today.completed,
            minutes: state.stats.today.totalMinutes
          })
          // فقط ۳۰ روز آخر
          state.stats.history = state.stats.history.slice(0, 30)
        }
        
        state.stats.today = {
          date: today,
          completed: 0,
          totalMinutes: 0
        }
      }
      
      state.stats.today.completed += 1
      state.stats.today.totalMinutes += minutes
      state.stats.allTime.completed += 1
      state.stats.allTime.totalMinutes += minutes

      saveStatsToStorage(state.stats)

      // افزایش شمارنده
      state.completedPomodoros += 1

      // تعیین نوع استراحت
      const shouldTakeLongBreak = state.completedPomodoros % state.settings.longBreakInterval === 0
      
      if (shouldTakeLongBreak) {
        state.mode = 'longBreak'
        state.timeLeft = state.settings.longBreakDuration * 60
      } else {
        state.mode = 'shortBreak'
        state.timeLeft = state.settings.shortBreakDuration * 60
      }

      state.isRunning = state.settings.autoStartBreaks
      state.startedAt = null
    },

    // ✅ تکمیل استراحت
    completeBreak: (state) => {
      state.mode = 'work'
      state.timeLeft = state.settings.workDuration * 60
      state.isRunning = state.settings.autoStartPomodoros
      state.startedAt = null
    },

    // ✅ اتصال به تسک
    setCurrentTask: (state, action) => {
      state.currentTaskId = action.payload
    },

    // ✅ آپدیت تنظیمات
    updateSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
      saveSettingsToStorage(state.settings)
      
      // اگر تایمر در حال اجرا نیست، timeLeft را آپدیت کن
      if (!state.isRunning) {
        if (state.mode === 'work') {
          state.timeLeft = state.settings.workDuration * 60
        } else if (state.mode === 'shortBreak') {
          state.timeLeft = state.settings.shortBreakDuration * 60
        } else {
          state.timeLeft = state.settings.longBreakDuration * 60
        }
      }
    },

    // ✅ ریست آمار
    resetStats: (state) => {
      state.stats = {
        today: {
          date: new Date().toDateString(),
          completed: 0,
          totalMinutes: 0
        },
        allTime: {
          completed: 0,
          totalMinutes: 0
        },
        history: []
      }
      state.completedPomodoros = 0
      saveStatsToStorage(state.stats)
    }
  }
})

export const {
  toggleTimer,
  startTimer,
  pauseTimer,
  resetTimer,
  tick,
  setMode,
  completeWork,
  completeBreak,
  setCurrentTask,
  updateSettings,
  resetStats
} = pomodoroSlice.actions

export default pomodoroSlice.reducer