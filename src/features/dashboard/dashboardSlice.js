import { createSlice } from '@reduxjs/toolkit'

// ✅ WIDGETS با کلید ترجمه
export const WIDGETS = {
  productivityScore: {
    id: 'productivityScore',
    titleKey: 'widgets.productivityScore',
    descKey: 'widgets.productivityScoreDesc',
    defaultSize: 'medium'
  },
  stats: {
    id: 'stats',
    titleKey: 'widgets.stats',
    descKey: 'widgets.statsDesc',
    defaultSize: 'large'
  },
  todayTasks: {
    id: 'todayTasks',
    titleKey: 'widgets.todayTasks',
    descKey: 'widgets.todayTasksDesc',
    defaultSize: 'medium'
  },
  quickActions: {
    id: 'quickActions',
    titleKey: 'widgets.quickActions',
    descKey: 'widgets.quickActionsDesc',
    defaultSize: 'small'
  },
  pomodoro: {
    id: 'pomodoro',
    titleKey: 'widgets.pomodoro',
    descKey: 'widgets.pomodoroDesc',
    defaultSize: 'small'
  },
  recentTasks: {
    id: 'recentTasks',
    titleKey: 'widgets.recentTasks',
    descKey: 'widgets.recentTasksDesc',
    defaultSize: 'medium'
  },
  upcomingDeadlines: {
    id: 'upcomingDeadlines',
    titleKey: 'widgets.upcomingDeadlines',
    descKey: 'widgets.upcomingDeadlinesDesc',
    defaultSize: 'medium'
  },
  notes: {
    id: 'notes',
    titleKey: 'widgets.notes',
    descKey: 'widgets.notesDesc',
    defaultSize: 'medium'
  },
  projectProgress: {
    id: 'projectProgress',
    titleKey: 'widgets.projectProgress',
    descKey: 'widgets.projectProgressDesc',
    defaultSize: 'large'
  },
  productivity: {
    id: 'productivity',
    titleKey: 'widgets.productivity',
    descKey: 'widgets.productivityDesc',
    defaultSize: 'large'
  },
  tags: {
    id: 'tags',
    titleKey: 'widgets.tags',
    descKey: 'widgets.tagsDesc',
    defaultSize: 'small'
  }
}

// ✅ چیدمان پیش‌فرض
const defaultLayout = [
  { id: 'productivityScore', size: 'medium', visible: true, order: 0 },
  { id: 'stats', size: 'large', visible: true, order: 1 },
  { id: 'quickActions', size: 'small', visible: true, order: 2 },
  { id: 'todayTasks', size: 'medium', visible: true, order: 3 },
  { id: 'pomodoro', size: 'small', visible: true, order: 4 },
  { id: 'upcomingDeadlines', size: 'medium', visible: true, order: 5 },
  { id: 'recentTasks', size: 'medium', visible: true, order: 6 },
  { id: 'notes', size: 'medium', visible: true, order: 7 },
  { id: 'projectProgress', size: 'large', visible: true, order: 8 },
  { id: 'productivity', size: 'large', visible: true, order: 9 },
  { id: 'tags', size: 'small', visible: true, order: 10 }
]

// ✅ بارگذاری چیدمان از localStorage
const getInitialLayout = () => {
  try {
    const saved = localStorage.getItem('smart-planner-dashboard-layout')
    if (saved) {
      const parsed = JSON.parse(saved)
      const existingIds = parsed.map(w => w.id)
      const newWidgets = defaultLayout.filter(w => !existingIds.includes(w.id))
      return [...parsed, ...newWidgets]
    }
  } catch (e) {
    console.error('Error loading dashboard layout:', e)
  }
  return defaultLayout
}

const initialState = {
  layout: getInitialLayout(),
  editMode: false
}

const saveLayoutToStorage = (layout) => {
  try {
    localStorage.setItem('smart-planner-dashboard-layout', JSON.stringify(layout))
  } catch (e) {
    console.error('Error saving dashboard layout:', e)
  }
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    toggleEditMode: (state) => {
      state.editMode = !state.editMode
    },
    toggleWidget: (state, action) => {
      const widget = state.layout.find(w => w.id === action.payload)
      if (widget) {
        widget.visible = !widget.visible
        saveLayoutToStorage(state.layout)
      }
    },
    setWidgetSize: (state, action) => {
      const { id, size } = action.payload
      const widget = state.layout.find(w => w.id === id)
      if (widget) {
        widget.size = size
        saveLayoutToStorage(state.layout)
      }
    },
    moveWidget: (state, action) => {
      const { id, direction } = action.payload
      const sorted = [...state.layout].sort((a, b) => a.order - b.order)
      const index = sorted.findIndex(w => w.id === id)
      if (index === -1) return
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= sorted.length) return
      const tempOrder = sorted[index].order
      sorted[index].order = sorted[newIndex].order
      sorted[newIndex].order = tempOrder
      state.layout = sorted
      saveLayoutToStorage(state.layout)
    },
    resetLayout: (state) => {
      state.layout = [...defaultLayout]
      saveLayoutToStorage(state.layout)
    },
    setLayout: (state, action) => {
      state.layout = action.payload
      saveLayoutToStorage(action.payload)
    }
  }
})

export const {
  toggleEditMode,
  toggleWidget,
  setWidgetSize,
  moveWidget,
  resetLayout,
  setLayout
} = dashboardSlice.actions

export default dashboardSlice.reducer