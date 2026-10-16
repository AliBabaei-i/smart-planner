import { createSlice } from '@reduxjs/toolkit'


export const ACHIEVEMENTS = {
  firstTask: {
    id: 'firstTask',
    titleKey: 'achievementItems.firstTask.title',
    descKey: 'achievementItems.firstTask.description',
    category: 'tasks',
    points: 10,
    check: (state) => state.totalTasksCreated >= 1
  },
  taskMaster10: {
    id: 'taskMaster10',
    titleKey: 'achievementItems.taskMaster10.title',
    descKey: 'achievementItems.taskMaster10.description',
    category: 'tasks',
    points: 25,
    check: (state) => state.totalTasksCompleted >= 10
  },
  taskMaster50: {
    id: 'taskMaster50',
    titleKey: 'achievementItems.taskMaster50.title',
    descKey: 'achievementItems.taskMaster50.description',
    category: 'tasks',
    points: 100,
    check: (state) => state.totalTasksCompleted >= 50
  },
  taskMaster100: {
    id: 'taskMaster100',
    titleKey: 'achievementItems.taskMaster100.title',
    descKey: 'achievementItems.taskMaster100.description',
    category: 'tasks',
    points: 250,
    check: (state) => state.totalTasksCompleted >= 100
  },
  firstProject: {
    id: 'firstProject',
    titleKey: 'achievementItems.firstProject.title',
    descKey: 'achievementItems.firstProject.description',
    category: 'projects',
    points: 15,
    check: (state) => state.totalProjectsCreated >= 1
  },
  projectManager: {
    id: 'projectManager',
    titleKey: 'achievementItems.projectManager.title',
    descKey: 'achievementItems.projectManager.description',
    category: 'projects',
    points: 50,
    check: (state) => state.totalProjectsCreated >= 5
  },
  firstPomodoro: {
    id: 'firstPomodoro',
    titleKey: 'achievementItems.firstPomodoro.title',
    descKey: 'achievementItems.firstPomodoro.description',
    category: 'pomodoro',
    points: 10,
    check: (state) => state.totalPomodoros >= 1
  },
  pomodoroMaster: {
    id: 'pomodoroMaster',
    titleKey: 'achievementItems.pomodoroMaster.title',
    descKey: 'achievementItems.pomodoroMaster.description',
    category: 'pomodoro',
    points: 150,
    check: (state) => state.totalPomodoros >= 50
  },
  pomodoroDay: {
    id: 'pomodoroDay',
    titleKey: 'achievementItems.pomodoroDay.title',
    descKey: 'achievementItems.pomodoroDay.description',
    category: 'pomodoro',
    points: 75,
    check: (state) => state.pomodorosInOneDay >= 8
  },
  streak3: {
    id: 'streak3',
    titleKey: 'achievementItems.streak3.title',
    descKey: 'achievementItems.streak3.description',
    category: 'streak',
    points: 30,
    check: (state) => state.currentStreak >= 3
  },
  streak7: {
    id: 'streak7',
    titleKey: 'achievementItems.streak7.title',
    descKey: 'achievementItems.streak7.description',
    category: 'streak',
    points: 100,
    check: (state) => state.currentStreak >= 7
  },
  streak30: {
    id: 'streak30',
    titleKey: 'achievementItems.streak30.title',
    descKey: 'achievementItems.streak30.description',
    category: 'streak',
    points: 500,
    check: (state) => state.currentStreak >= 30
  },
  timeWarrior: {
    id: 'timeWarrior',
    titleKey: 'achievementItems.timeWarrior.title',
    descKey: 'achievementItems.timeWarrior.description',
    category: 'time',
    points: 75,
    check: (state) => state.totalTimeMinutes >= 24 * 60
  },
  timeMaster: {
    id: 'timeMaster',
    titleKey: 'achievementItems.timeMaster.title',
    descKey: 'achievementItems.timeMaster.description',
    category: 'time',
    points: 200,
    check: (state) => state.totalTimeMinutes >= 100 * 60
  },
  tagUser: {
    id: 'tagUser',
    titleKey: 'achievementItems.tagUser.title',
    descKey: 'achievementItems.tagUser.description',
    category: 'tags',
    points: 15,
    check: (state) => state.totalTags >= 1
  },
  tagMaster: {
    id: 'tagMaster',
    titleKey: 'achievementItems.tagMaster.title',
    descKey: 'achievementItems.tagMaster.description',
    category: 'tags',
    points: 60,
    check: (state) => state.totalTags >= 10
  },
  perfectionist: {
    id: 'perfectionist',
    titleKey: 'achievementItems.perfectionist.title',
    descKey: 'achievementItems.perfectionist.description',
    category: 'productivity',
    points: 100,
    check: (state) => state.hasPerfectDay
  },
  consistent: {
    id: 'consistent',
    titleKey: 'achievementItems.consistent.title',
    descKey: 'achievementItems.consistent.description',
    category: 'productivity',
    points: 50,
    check: (state) => state.averageProductivity >= 80
  },
  earlyBird: {
    id: 'earlyBird',
    titleKey: 'achievementItems.earlyBird.title',
    descKey: 'achievementItems.earlyBird.description',
    category: 'special',
    points: 40,
    check: (state) => state.earlyBird
  },
  nightOwl: {
    id: 'nightOwl',
    titleKey: 'achievementItems.nightOwl.title',
    descKey: 'achievementItems.nightOwl.description',
    category: 'special',
    points: 40,
    check: (state) => state.nightOwl
  }
}

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('smart-planner-achievements')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...parsed, newlyUnlocked: [] }
    }
  } catch (e) {
    console.error('Error loading achievements:', e)
  }
  return {
    unlocked: [],
    totalPoints: 0,
    totalTasksCreated: 0,
    totalTasksCompleted: 0,
    totalProjectsCreated: 0,
    totalPomodoros: 0,
    totalTimeMinutes: 0,
    totalTags: 0,
    currentStreak: 0,
    lastActiveDate: null,
    activeDates: [],
    pomodorosInOneDay: 0,
    lastPomodoroDate: null,
    hasPerfectDay: false,
    averageProductivity: 0,
    earlyBird: false,
    nightOwl: false,
    newlyUnlocked: []
  }
}

const saveToStorage = (state) => {
  try {
    localStorage.setItem('smart-planner-achievements', JSON.stringify({
      unlocked: state.unlocked,
      totalPoints: state.totalPoints,
      totalTasksCreated: state.totalTasksCreated,
      totalTasksCompleted: state.totalTasksCompleted,
      totalProjectsCreated: state.totalProjectsCreated,
      totalPomodoros: state.totalPomodoros,
      totalTimeMinutes: state.totalTimeMinutes,
      totalTags: state.totalTags,
      currentStreak: state.currentStreak,
      lastActiveDate: state.lastActiveDate,
      activeDates: state.activeDates,
      pomodorosInOneDay: state.pomodorosInOneDay,
      lastPomodoroDate: state.lastPomodoroDate,
      hasPerfectDay: state.hasPerfectDay,
      averageProductivity: state.averageProductivity,
      earlyBird: state.earlyBird,
      nightOwl: state.nightOwl
    }))
  } catch (e) {
    console.error('Error saving achievements:', e)
  }
}

const checkAchievements = (state) => {
  const newlyUnlocked = []
  
  Object.values(ACHIEVEMENTS).forEach(achievement => {
    if (!state.unlocked.includes(achievement.id)) {
      if (achievement.check(state)) {
        state.unlocked.push(achievement.id)
        state.totalPoints += achievement.points
        newlyUnlocked.push(achievement.id)
      }
    }
  })

  if (newlyUnlocked.length > 0) {
    state.newlyUnlocked = [...state.newlyUnlocked, ...newlyUnlocked]
  }
}

const achievementsSlice = createSlice({
  name: 'achievements',
  initialState: getInitialState(),
  reducers: {
    onTaskCreated: (state) => {
      state.totalTasksCreated += 1
      checkAchievements(state)
      saveToStorage(state)
    },    // ✅ حذف یک دستاورد خاص از لیست جدیدها
    removeOneNewlyUnlocked: (state, action) => {
      state.newlyUnlocked = state.newlyUnlocked.filter(id => id !== action.payload)
    },

    onTaskCompleted: (state, action) => {
      state.totalTasksCompleted += 1
      
      const now = new Date()
      const hour = now.getHours()
      
      if (hour < 6) state.earlyBird = true
      if (hour >= 23) state.nightOwl = true

      const today = now.toDateString()
      if (state.lastActiveDate !== today) {
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        
        if (state.lastActiveDate === yesterday.toDateString()) {
          state.currentStreak += 1
        } else if (state.lastActiveDate) {
          state.currentStreak = 1
        } else {
          state.currentStreak = 1
        }
        
        state.lastActiveDate = today
        
        if (!state.activeDates.includes(today)) {
          state.activeDates.push(today)
          state.activeDates = state.activeDates.slice(-90)
        }
      }

      if (action.payload?.actualTime) {
        state.totalTimeMinutes += action.payload.actualTime
      }

      checkAchievements(state)
      saveToStorage(state)
    },

    onProjectCreated: (state) => {
      state.totalProjectsCreated += 1
      checkAchievements(state)
      saveToStorage(state)
    },

    onPomodoroCompleted: (state) => {
      state.totalPomodoros += 1
      
      const today = new Date().toDateString()
      
      if (state.lastPomodoroDate === today) {
        state.pomodorosInOneDay += 1
      } else {
        state.pomodorosInOneDay = 1
        state.lastPomodoroDate = today
      }

      checkAchievements(state)
      saveToStorage(state)
    },

    onTagAdded: (state, action) => {
      state.totalTags = action.payload || state.totalTags
      checkAchievements(state)
      saveToStorage(state)
    },

    updateProductivity: (state, action) => {
      if (action.payload >= 100) {
        state.hasPerfectDay = true
      }
      
      state.averageProductivity = Math.round(
        (state.averageProductivity * 0.7) + (action.payload * 0.3)
      )

      checkAchievements(state)
      saveToStorage(state)
    },

    clearNewlyUnlocked: (state) => {
      state.newlyUnlocked = []
    },

    resetAchievements: (state) => {
      const fresh = getInitialState()
      Object.keys(fresh).forEach(key => {
        state[key] = fresh[key]
      })
      saveToStorage(state)
    }
  }
})

export const {
  onTaskCreated,
  onTaskCompleted,
  onProjectCreated,
  onPomodoroCompleted,
  onTagAdded,
  updateProductivity,
  clearNewlyUnlocked,removeOneNewlyUnlocked,
  resetAchievements
} = achievementsSlice.actions

export default achievementsSlice.reducer