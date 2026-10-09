// import { createSlice } from '@reduxjs/toolkit'
// import { v4 as uuidv4 } from 'uuid'

// const initialState = {
//   notifications: [],
//   settings: {
//     taskReminders: true,
//     dueDateAlerts: true,
//     productivityReports: false,
//     soundEnabled: true,
//     pushEnabled: true
//   }
// }

// const notificationsSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     // افزودن اعلان جدید
//     addNotification: (state, action) => {
//       const newNotification = {
//         id: uuidv4(),
//         type: action.payload.type || 'info', // 'info', 'warning', 'success', 'error'
//         title: action.payload.title,
//         message: action.payload.message,
//         read: false,
//         createdAt: new Date().toISOString(),
//         action: action.payload.action // optional: { label: 'مشاهده', url: '/tasks' }
//       }
//       state.notifications.unshift(newNotification) // اضافه به ابتدای لیست
//     },

//     // علامت‌گذاری اعلان به عنوان خوانده شده
//     markAsRead: (state, action) => {
//       const notification = state.notifications.find(n => n.id === action.payload)
//       if (notification) {
//         notification.read = true
//       }
//     },

//     // حذف اعلان
//     removeNotification: (state, action) => {
//       state.notifications = state.notifications.filter(n => n.id !== action.payload)
//     },

//     // خواندن همه اعلان‌ها
//     markAllAsRead: (state) => {
//       state.notifications.forEach(notification => {
//         notification.read = true
//       })
//     },

//     // حذف همه اعلان‌ها
//     clearAllNotifications: (state) => {
//       state.notifications = []
//     },

//     // آپدیت تنظیمات اعلان‌ها
//     updateNotificationSettings: (state, action) => {
//       state.settings = { ...state.settings, ...action.payload }
//     }
//   }
// })

// export const {
//   addNotification,
//   markAsRead,
//   removeNotification,
//   markAllAsRead,
//   clearAllNotifications,
//   updateNotificationSettings
// } = notificationsSlice.actions

// export default notificationsSlice.reducer

import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

const initialState = {
  notifications: [],
  settings: {
    taskReminders: true,
    dueDateAlerts: true,
    productivityReports: true,  // ← پیش‌فرض true
    soundEnabled: true,
    pushEnabled: true
  }
}
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // افزودن اعلان جدید
    addNotification: (state, action) => {
      const newNotification = {
        id: uuidv4(),
        type: action.payload.type || 'info', // 'info', 'warning', 'success', 'error'
        title: action.payload.title,
        message: action.payload.message,
        read: false,
        createdAt: new Date().toISOString(),
        action: action.payload.action // optional: { label: 'مشاهده', url: '/tasks' }
      }
      state.notifications.unshift(newNotification) // اضافه به ابتدای لیست
    },

    // علامت‌گذاری اعلان به عنوان خوانده شده
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload)
      if (notification) {
        notification.read = true
      }
    },

    // حذف اعلان
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload)
    },

    // خواندن همه اعلان‌ها
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
    },

    // حذف همه اعلان‌ها
    clearAllNotifications: (state) => {
      state.notifications = []
    },

    // آپدیت تنظیمات اعلان‌ها
    updateNotificationSettings: (state, action) => {
      state.settings = { ...state.settings, ...action.payload }
    }
  }
})

export const {
  addNotification,
  markAsRead,
  removeNotification,
  markAllAsRead,
  clearAllNotifications,
  updateNotificationSettings
} = notificationsSlice.actions

export default notificationsSlice.reducer