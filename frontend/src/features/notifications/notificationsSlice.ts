import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
// ✅ همه‌ی انواع قبلی + جدید
export type NotificationType =
  | 'task_due'
  | 'task_overdue'
  | 'achievement'
  | 'sync_error'
  | 'sync_success'
  | 'pomodoro_done'
  | 'habit_streak'
  | 'finance_budget'
  | 'system'
  | 'info'
  | 'warning'
  | 'success'
  | 'error'

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface AppNotification {
  id: string
  type: NotificationType
  priority?: NotificationPriority
  title: string
  message: string
  actionPath?: string
  /** ✅ سازگاری با Notifications.jsx قدیمی */
  action?: { label?: string; url?: string }
  meta?: Record<string, string | number | boolean | null>
  read: boolean
  dismissed?: boolean
  createdAt: string
}

export interface NotificationsSettings {
  // ✅ قدیمی (NotificationSettings.jsx)
  taskReminders: boolean
  dueDateAlerts: boolean
  productivityReports: boolean
  soundEnabled: boolean
  pushEnabled: boolean
  // ✅ جدید
  enabled: boolean
  showToasts: boolean
  maxItems: number
  mutedTypes: NotificationType[]
}

export interface NotificationsState {
  notifications: AppNotification[]
  settings: NotificationsSettings
}

const initialState: NotificationsState = {
  notifications: [],
  settings: {
    taskReminders: true,
    dueDateAlerts: true,
    productivityReports: true,
    soundEnabled: true,
    pushEnabled: true,
    enabled: true,
    showToasts: true,
    maxItems: 100,
    mutedTypes: [],
  },
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<any>) => {
      const p = action.payload || {}
      if (!state.settings.enabled) return
      if (state.settings.mutedTypes.includes(p.type)) return

      const notification: AppNotification = {
        id: p.id || uuidv4(),
        type: p.type || 'info',
        priority: p.priority,
        title: p.title || '',
        message: p.message || '',
        actionPath: p.actionPath || p.action?.url,
        action: p.action,
        meta: p.meta,
        read: false,
        dismissed: false,
        createdAt: p.createdAt || new Date().toISOString(),
      }

      // dedup در ۵ دقیقه اخیر
      const fiveMinAgo = Date.now() - 5 * 60 * 1000
      const isDuplicate = state.notifications.some(
        (n) =>
          n.type === notification.type &&
          JSON.stringify(n.meta) === JSON.stringify(notification.meta) &&
          new Date(n.createdAt).getTime() > fiveMinAgo
      )
      if (isDuplicate) return

      state.notifications.unshift(notification)
      if (state.notifications.length > (state.settings.maxItems || 100)) {
        state.notifications = state.notifications.slice(0, state.settings.maxItems)
      }
    },

    markAsRead: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find((x) => x.id === action.payload)
      if (n) n.read = true
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((x) => x.id !== action.payload)
    },

    dismissNotification: (state, action: PayloadAction<string>) => {
      const n = state.notifications.find((x) => x.id === action.payload)
      if (n) {
        n.dismissed = true
        n.read = true
      }
    },

    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true
      })
    },

    clearAllNotifications: (state) => {
      state.notifications = []
    },

    clearAll: (state) => {
      state.notifications = []
    },

    clearReadNotifications: (state) => {
      state.notifications = state.notifications.filter((n) => !n.read)
    },

    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<NotificationsSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload }
    },

    updateSettings: (
      state,
      action: PayloadAction<Partial<NotificationsSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload }
    },

    toggleMuteType: (state, action: PayloadAction<NotificationType>) => {
      const idx = state.settings.mutedTypes.indexOf(action.payload)
      if (idx >= 0) state.settings.mutedTypes.splice(idx, 1)
      else state.settings.mutedTypes.push(action.payload)
    },
  },
})

export const {
  addNotification,
  markAsRead,
  removeNotification,
  dismissNotification,
  markAllAsRead,
  clearAllNotifications,
  clearAll,
  clearReadNotifications,
  updateNotificationSettings,
  updateSettings,
  toggleMuteType,
} = notificationsSlice.actions

// ═══════════════════════════════════════════════
// ✅ Selectors — سازگار با state قدیمی
// ═══════════════════════════════════════════════

const selectNotificationsArray = (state: any): AppNotification[] =>
  state.notifications?.notifications || []

export const selectAllNotifications = createSelector(
  [selectNotificationsArray],
  (notifications): AppNotification[] =>
    notifications.filter((n) => !n.dismissed)
)

export const selectUnreadCount = createSelector(
  [selectNotificationsArray],
  (notifications): number =>
    notifications.filter((n) => !n.read && !n.dismissed).length
)

export const selectNotificationSettings = createSelector(
  [(state: any) => state.notifications?.settings],
  (settings) => settings || {}
)
export default notificationsSlice.reducer