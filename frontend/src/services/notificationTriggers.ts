import { store } from '../app/store'

interface NotifyOptions {
  type: string
  title: string
  message: string
  actionPath?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  meta?: Record<string, string | number | boolean | null>
}

export const notify = (opts: NotifyOptions) => {
  try {
    store.dispatch({ type: 'notifications/addNotification', payload: opts })
  } catch (err) {
    console.warn('Notification dispatch failed:', err)
  }
}

// ═══════════════════════════════════════════════
// ✅ Triggers
// ═══════════════════════════════════════════════

export const notifySyncError = (error: string) => {
  notify({
    type: 'sync_error',
    title: 'خطای سینک',
    message: error,
    priority: 'high',
  })
}

export const notifySyncSuccess = (itemsCount: number) => {
  if (itemsCount <= 0) return
  notify({
    type: 'sync_success',
    title: 'سینک موفق',
    message: `${itemsCount} تغییر همگام شد`,
    priority: 'low',
    meta: { itemsCount },
  })
}

export const notifyTaskCompleted = (taskTitle: string) => {
  notify({
    type: 'info',
    title: 'کار انجام شد ✅',
    message: taskTitle,
    priority: 'low',
  })
}

export const notifyAchievementUnlocked = (title: string) => {
  notify({
    type: 'achievement',
    title: 'دستاورد جدید! 🏆',
    message: title,
    actionPath: '/achievements',
    priority: 'high',
  })
}

export const notifyPomodoroDone = (minutes: number) => {
  notify({
    type: 'pomodoro_done',
    title: 'پومودورو تمام شد',
    message: `${minutes} دقیقه تمرکز کردی!`,
    actionPath: '/',
    priority: 'high',
  })
}

export const notifyBudgetThreshold = (category: string, percentage: number) => {
  notify({
    type: 'finance_budget',
    title: 'هشدار بودجه',
    message: `${category}: ${percentage}% مصرف شده`,
    actionPath: '/finance',
    priority: percentage >= 100 ? 'urgent' : 'high',
    meta: { category, percentage },
  })
}

export const notifyTaskDueTomorrow = (taskTitle: string) => {
  notify({
    type: 'task_due',
    title: 'ددلاین فردا',
    message: taskTitle,
    actionPath: '/tasks',
    priority: 'high',
  })
}