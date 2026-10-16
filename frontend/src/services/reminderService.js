import { toast } from 'react-toastify'
import store from '../app/store'
import i18n from '../i18n/config'
class ReminderService {
  constructor() {
    this.checkInterval = null
    this.checkedTasks = new Set()
    this.started = false
    this.welcomeShown = false
  }

 start() {
  if (this.started) return
  this.started = true

  console.log('✅ سرویس یادآوری فعال شد')

  // ✅ فقط یک بار اعلان خوش‌آمدگویی
  if (!this.welcomeShown && !localStorage.getItem('welcome-shown')) {
    setTimeout(() => {
      // ✅ چک زبان فعلی
      let isPersian = true
      try {
        const lang = document.documentElement.getAttribute('lang')
        isPersian = !lang || lang === 'fa' || lang.startsWith('fa')
      } catch {}
      
      toast.info(
        isPersian 
          ? '👋 به برنامه‌ریزی هوشمند خوش آمدید!'
          : '👋 Welcome to Smart Planner!',
        {
          position: "bottom-left",
          autoClose: 4000,
        }
      )
      localStorage.setItem('welcome-shown', 'true')
      this.welcomeShown = true
    }, 3000)
  }

  // ✅ بررسی تسک‌های واقعی هر ۵ دقیقه
  this.checkInterval = setInterval(() => {
    this.checkDueDateReminders()
  }, 5 * 60 * 1000)

  setTimeout(() => this.checkDueDateReminders(), 30000)
}

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.started = false
    console.log('❌ سرویس یادآوری متوقف شد')
  }

  // ✅ بررسی تسک‌های واقعی از Redux
  checkDueDateReminders() {
    try {
      const state = store.getState()
      const { tasks = [] } = state.tasks || {}
      const { settings } = state.notifications || {}

      if (!settings?.dueDateAlerts) return

      const now = new Date()

      tasks.forEach(task => {
        if (!task.dueDate || task.completed || this.checkedTasks.has(task.id)) return

        const dueDate = new Date(task.dueDate)
        
        // اگر dueTime دارد، ساعت رو اعمال کن
        if (task.dueTime !== null && task.dueTime !== undefined) {
          dueDate.setHours(task.dueTime, 0, 0, 0)
        }

        const diffMs = dueDate.getTime() - now.getTime()
        const hoursDiff = diffMs / (1000 * 60 * 60)

        // ۱ ساعت قبل
        if (hoursDiff > 0 && hoursDiff <= 1) {
          toast.warn(`"${task.title}" - ${i18n.t('notifications.dueSoon')}`, {
            position: "bottom-left",
            autoClose: 8000,
          })
          this.checkedTasks.add(task.id)
        }
        // امروز
        else if (dueDate.toDateString() === now.toDateString() && hoursDiff > 0 && hoursDiff <= 12) {
          toast.info(`"${task.title}" - ${i18n.t('notifications.dueToday')}`, {
            position: "bottom-left",
            autoClose: 6000,
          })
          this.checkedTasks.add(task.id)
        }
        // گذشته (تا ۷ روز اخیر)
        else if (hoursDiff < 0 && hoursDiff > -168) {
          toast.error(`"${task.title}" - ${i18n.t('notifications.overdue')}`, {
            position: "bottom-left",
            autoClose: 8000,
          })
          this.checkedTasks.add(task.id)
        }
      })
    } catch (error) {
      console.error('Error checking reminders:', error)
    }
  }

  // ✅ پاک کردن cache
  cleanupCheckedTasks() {
    const state = store.getState()
    const { tasks = [] } = state.tasks || {}
    
    tasks.forEach(task => {
      if (task.completed) {
        this.checkedTasks.delete(task.id)
      }
    })
  }
}

export const reminderService = new ReminderService()
export default reminderService