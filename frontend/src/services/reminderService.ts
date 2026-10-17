import { toast } from 'react-toastify'
import store from '../app/store'
import i18n from '../i18n/config'

class ReminderService {
  private checkInterval: ReturnType<typeof setInterval> | null = null
  private checkedTasks = new Set<string>()
  private started = false
  private welcomeShown = false

  start(): void {
    if (this.started) return
    this.started = true
    console.log('✅ سرویس یادآوری فعال شد')

    if (!this.welcomeShown && !localStorage.getItem('welcome-shown')) {
      setTimeout(() => {
        let isPersian = true
        try {
          const lang = document.documentElement.getAttribute('lang')
          isPersian = !lang || lang === 'fa' || lang.startsWith('fa')
        } catch {}
        toast.info(isPersian ? '👋 خوش آمدید!' : '👋 Welcome!', { position: 'bottom-left', autoClose: 4000 })
        localStorage.setItem('welcome-shown', 'true')
        this.welcomeShown = true
      }, 3000)
    }

    this.checkInterval = setInterval(() => this.checkDueDateReminders(), 5 * 60 * 1000)
    setTimeout(() => this.checkDueDateReminders(), 30000)
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.started = false
    console.log('❌ سرویس یادآوری متوقف شد')
  }

  private checkDueDateReminders(): void {
    try {
      const state: any = store.getState()
      const tasks = state.tasks?.tasks || []
      const settings = state.notifications?.settings || {}
      if (!settings.dueDateAlerts) return

      const now = new Date()
      tasks.forEach((task: any) => {
        if (!task.dueDate || task.completed || this.checkedTasks.has(task.id)) return
        const dueDate = new Date(task.dueDate)
        if (task.dueTime !== null && task.dueTime !== undefined) {
          dueDate.setHours(task.dueTime, 0, 0, 0)
        }
        const hoursDiff = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursDiff > 0 && hoursDiff <= 1) {
          toast.warn(`"${task.title}" - ${i18n.t('notifications.dueSoon')}`, { position: 'bottom-left', autoClose: 8000 })
          this.checkedTasks.add(task.id)
        } else if (dueDate.toDateString() === now.toDateString() && hoursDiff > 0 && hoursDiff <= 12) {
          toast.info(`"${task.title}" - ${i18n.t('notifications.dueToday')}`, { position: 'bottom-left', autoClose: 6000 })
          this.checkedTasks.add(task.id)
        } else if (hoursDiff < 0 && hoursDiff > -168) {
          toast.error(`"${task.title}" - ${i18n.t('notifications.overdue')}`, { position: 'bottom-left', autoClose: 8000 })
          this.checkedTasks.add(task.id)
        }
      })
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }
}

export const reminderService = new ReminderService()
export default reminderService