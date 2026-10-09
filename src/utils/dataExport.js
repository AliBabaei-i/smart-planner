import { toast } from 'react-toastify'
import i18n from '../i18n/config'

/**
 * ✅ Export تمام داده‌ها به فایل JSON
 */
export const exportData = () => {
  try {
    const projectsData = JSON.parse(localStorage.getItem('smart-planner-projects') || '{}')
    const tasksData = JSON.parse(localStorage.getItem('smart-planner-tasks') || '{}')
    const notificationsData = JSON.parse(localStorage.getItem('smart-planner-notifications') || '{}')
    const themeData = JSON.parse(localStorage.getItem('smart-planner-theme') || '{}')
    const pomodoroData = JSON.parse(localStorage.getItem('smart-planner-pomodoro') || '{}')
    const achievementsData = JSON.parse(localStorage.getItem('smart-planner-achievements') || '{}')
    const dashboardData = JSON.parse(localStorage.getItem('smart-planner-dashboard-layout') || '[]')

    const exportData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      exportType: 'full',
      metadata: {
        appName: 'Smart Planner',
        appVersion: '2.0.0',
        totalProjects: projectsData.projects?.length || 0,
        totalTasks: tasksData.tasks?.length || 0,
        completedTasks: tasksData.tasks?.filter(t => t.completed).length || 0,
        totalTime: tasksData.tasks?.reduce((sum, t) => sum + (t.actualTime || 0), 0) || 0,
        availableTags: tasksData.availableTags || []
      },
      // ✅ داده‌های اصلی
      projects: projectsData.projects || [],
      tasks: tasksData.tasks || [],
      availableTags: tasksData.availableTags || [],
      // ✅ تنظیمات (اختیاری)
      settings: {
        theme: themeData,
        notifications: notificationsData,
        pomodoro: pomodoroData,
        achievements: achievementsData,
        dashboard: dashboardData
      }
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `smart-planner-backup-${new Date().toISOString().split('T')[0]}.json`
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)

    return { success: true, message: 'داده‌ها با موفقیت export شدند' }
  } catch (error) {
    console.error('Error exporting data:', error)
    return { success: false, message: 'خطا در export داده‌ها' }
  }
}

/**
 * ✅ Import داده‌ها از فایل JSON
 */
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        // ✅ اعتبارسنجی
        if (!importedData.projects || !Array.isArray(importedData.projects)) {
          throw new Error('فایل باید شامل آرایه "projects" باشد')
        }

        if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
          throw new Error('فایل باید شامل آرایه "tasks" باشد')
        }

        // ✅ پردازش و اطمینان از کامل بودن داده‌ها
        const processedProjects = importedData.projects.map(p => ({
          id: p.id || `project-${Date.now()}-${Math.random()}`,
          name: p.name || 'بدون نام',
          description: p.description || '',
          color: p.color || '#3b82f6',
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString()
        }))

        const processedTasks = importedData.tasks.map(t => ({
          id: t.id || `task-${Date.now()}-${Math.random()}`,
          title: t.title || 'بدون عنوان',
          description: t.description || '',
          projectId: t.projectId || processedProjects[0]?.id || '',
          priority: t.priority || 'medium',
          status: t.status || 'todo',
          dueDate: t.dueDate || null,
          dueTime: t.dueTime !== null && t.dueTime !== undefined ? parseInt(t.dueTime) : null,
          timeEstimate: t.timeEstimate ? parseInt(t.timeEstimate) : null,
          actualTime: t.actualTime || 0,
          completed: t.completed || false,
          // ✅ ویژگی‌های جدید
          subtasks: (t.subtasks || []).map(st => ({
            id: st.id || `subtask-${Date.now()}-${Math.random()}`,
            title: st.title || '',
            completed: st.completed || false,
            createdAt: st.createdAt || new Date().toISOString()
          })),
          notes: t.notes || '',
          tags: t.tags || [],
          recurring: t.recurring || null,
          recurringEndDate: t.recurringEndDate || null,
          parentTaskId: t.parentTaskId || null,
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString()
        }))

        // ✅ جمع‌آوری همه تگ‌ها
        const allTags = new Set(importedData.availableTags || [])
        processedTasks.forEach(task => {
          (task.tags || []).forEach(tag => allTags.add(tag))
        })

        // ✅ ذخیره در LocalStorage
        localStorage.setItem('smart-planner-projects', JSON.stringify({
          projects: processedProjects,
          loading: false,
          error: null
        }))

        localStorage.setItem('smart-planner-tasks', JSON.stringify({
          tasks: processedTasks,
          availableTags: [...allTags],
          loading: false,
          error: null
        }))

        // ✅ اگر تنظیمات هم بود
        if (importedData.settings) {
          if (importedData.settings.theme) {
            localStorage.setItem('smart-planner-theme', JSON.stringify(importedData.settings.theme))
          }
          if (importedData.settings.notifications) {
            localStorage.setItem('smart-planner-notifications', JSON.stringify(importedData.settings.notifications))
          }
          if (importedData.settings.pomodoro) {
            localStorage.setItem('smart-planner-pomodoro', JSON.stringify(importedData.settings.pomodoro))
          }
          if (importedData.settings.achievements) {
            localStorage.setItem('smart-planner-achievements', JSON.stringify(importedData.settings.achievements))
          }
          if (importedData.settings.dashboard) {
            localStorage.setItem('smart-planner-dashboard-layout', JSON.stringify(importedData.settings.dashboard))
          }
        }

        resolve({
          success: true,
          message: `با موفقیت import شد: ${processedProjects.length} پروژه و ${processedTasks.length} کار`
        })
      } catch (error) {
        console.error('Import error:', error)
        reject({
          success: false,
          message: error.message || 'خطا در import فایل'
        })
      }
    }

    reader.onerror = () => {
      reject({ success: false, message: 'خطا در خواندن فایل' })
    }

    reader.readAsText(file, 'UTF-8')
  })
}

/**
 * ✅ پاک کردن تمام داده‌ها
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem('smart-planner-projects')
    localStorage.removeItem('smart-planner-tasks')
    localStorage.removeItem('smart-planner-notifications')
    localStorage.removeItem('smart-planner-auth')
    localStorage.removeItem('smart-planner-theme')
    localStorage.removeItem('smart-planner-theme-mode')
    localStorage.removeItem('smart-planner-theme-colors')
    localStorage.removeItem('smart-planner-theme-settings')
    localStorage.removeItem('smart-planner-pomodoro')
    localStorage.removeItem('smart-planner-pomodoro-stats')
    localStorage.removeItem('smart-planner-pomodoro-settings')
    localStorage.removeItem('smart-planner-achievements')
    localStorage.removeItem('smart-planner-dashboard-layout')
    localStorage.removeItem('smart-planner-primary-color')
    localStorage.removeItem('welcome-shown')

    return { success: true, message: 'تمام داده‌ها پاک شدند' }
  } catch (error) {
    console.error('Error clearing data:', error)
    return { success: false, message: 'خطا در پاک کردن داده‌ها' }
  }
}

/**
 * ✅ دانلود فایل نمونه کامل با همه ویژگی‌ها
 */
export const downloadSampleFile = () => {
  try {
    // ✅ تاریخ‌های نسبی برای نمونه
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)
    const lastWeek = new Date(today)
    lastWeek.setDate(today.getDate() - 7)

    const formatDate = (date) => date.toISOString().split('T')[0]

    const sampleData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      exportType: 'sample',
      metadata: {
        appName: 'Smart Planner',
        appVersion: '2.0.0',
        description: 'فایل نمونه کامل با تمام ویژگی‌ها - شامل زیرتسک، تگ، تکرار، اولویت، زمان و...',
        features: [
          'پروژه‌ها با رنگ‌بندی',
          'کارها با اولویت',
          'زیرتسک‌ها',
          'تگ‌ها',
          'تاریخ و ساعت انجام',
          'کار زمان   و واقعی',
          'تکرار کارها (روزانه/هفتگی/ماهانه)',
          'یادداشت‌ها'
        ]
      },
      projects: [
        {
          id: 'sample-project-1',
          name: 'مطالعه زبان انگلیسی',
          description: 'یادگیری زبان انگلیسی سطح متوسط - تمرکز روی مکالمه و لغات',
          color: '#3b82f6',
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-project-2',
          name: 'ورزش و تناسب اندام',
          description: 'برنامه ورزشی روزانه - کاردیو و تمرین با وزنه',
          color: '#10b981',
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'sample-project-3',
          name: 'پروژه برنامه‌نویسی',
          description: 'یادگیری React و ساخت اپلیکیشن',
          color: '#8b5cf6',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      tasks: [
        // ✅ کار 1: کامل با همه ویژگی‌ها (زیرتسک، تگ، تکرار، یادداشت)
        {
          id: 'sample-task-1',
          title: 'مطالعه فصل اول کتاب گرامر',
          description: 'مطالعه دقیق ساختار Present Simple و Present Continuous',
          projectId: 'sample-project-1',
          priority: 'high',
          status: 'todo',
          dueDate: formatDate(today),
          dueTime: 9,
          timeEstimate: 60,
          actualTime: 45,
          completed: false,
          subtasks: [
            { id: 'subtask-1-1', title: 'خواندن ۳۰ صفحه', completed: true, createdAt: new Date().toISOString() },
            { id: 'subtask-1-2', title: 'حل تمرین‌های فصل', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-1-3', title: 'خلاصه‌نویسی نکات مهم', completed: false, createdAt: new Date().toISOString() }
          ],
          notes: 'یادآوری: صفحات ۱۵-۲۰ رو دوباره مرور کنم. تمرین‌های ۵ و ۷ مهم‌ترن.',
          tags: ['مطالعه', 'زبان', 'گرامر'],
          recurring: null,
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 2: با تکرار روزانه
        {
          id: 'sample-task-2',
          title: 'مرور فلش‌کارت لغات جدید',
          description: 'مرور ۵۰ لغت جدید با اپلیکیشن',
          projectId: 'sample-project-1',
          priority: 'medium',
          status: 'todo',
          dueDate: formatDate(today),
          dueTime: 14,
          timeEstimate: 30,
          actualTime: 0,
          completed: false,
          subtasks: [
            { id: 'subtask-2-1', title: 'مرور لغات روز گذشته', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-2-2', title: 'یادگیری ۲۰ لغت جدید', completed: false, createdAt: new Date().toISOString() }
          ],
          notes: 'استفاده از اپلیکیشن Anki',
          tags: ['زبان', 'لغت'],
          recurring: 'daily',
          recurringEndDate: formatDate(nextWeek),
          parentTaskId: null,
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 3: انجام شده
        {
          id: 'sample-task-3',
          title: 'دویدن صبحگاهی',
          description: '۳۰ دقیقه دویدن در پارک + ۱۰ دقیقه گرم‌کردن',
          projectId: 'sample-project-2',
          priority: 'high',
          status: 'completed',
          dueDate: formatDate(today),
          dueTime: 6,
          timeEstimate: 40,
          actualTime: 45,
          completed: true,
          subtasks: [],
          notes: 'امروز رکورد زدم! ۵.۲ کیلومتر',
          tags: ['ورزش', 'کاردیو', 'صبحگاهی'],
          recurring: 'daily',
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 4: با تکرار هفتگی
        {
          id: 'sample-task-4',
          title: 'تمرین با وزنه - بالاتنه',
          description: '۴ ست پرس سینه، ۳ ست جلو بازو، ۳ ست پشت بازو',
          projectId: 'sample-project-2',
          priority: 'medium',
          status: 'todo',
          dueDate: formatDate(tomorrow),
          dueTime: 18,
          timeEstimate: 60,
          actualTime: 0,
          completed: false,
          subtasks: [
            { id: 'subtask-4-1', title: 'گرم کردن ۱۰ دقیقه', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-4-2', title: 'پرس سینه ۴ ست', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-4-3', title: 'جلو بازو ۳ ست', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-4-4', title: 'پشت بازو ۳ ست', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-4-5', title: 'سرد کردن', completed: false, createdAt: new Date().toISOString() }
          ],
          notes: 'سنگین‌تر از هفته قبل',
          tags: ['ورزش', 'وزنه'],
          recurring: 'weekly',
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: lastWeek.toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 5: پروژه برنامه‌نویسی
        {
          id: 'sample-task-5',
          title: 'یادگیری React Hooks',
          description: 'مطالعه useState، useEffect، useContext، useReducer',
          projectId: 'sample-project-3',
          priority: 'high',
          status: 'todo',
          dueDate: formatDate(tomorrow),
          dueTime: 10,
          timeEstimate: 120,
          actualTime: 60,
          completed: false,
          subtasks: [
            { id: 'subtask-5-1', title: 'مطالعه useState', completed: true, createdAt: new Date().toISOString() },
            { id: 'subtask-5-2', title: 'مطالعه useEffect', completed: true, createdAt: new Date().toISOString() },
            { id: 'subtask-5-3', title: 'مطالعه useContext', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-5-4', title: 'ساخت پروژه کوچک', completed: false, createdAt: new Date().toISOString() }
          ],
          notes: 'مستندات رسمی React بهترین منبعه',
          tags: ['برنامه‌نویسی', 'React', 'آموزش'],
          recurring: null,
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 6: تکرار ماهانه
        {
          id: 'sample-task-6',
          title: 'پرداخت قبض‌ها',
          description: 'برق، آب، گاز، اینترنت',
          projectId: 'sample-project-1',
          priority: 'high',
          status: 'todo',
          dueDate: formatDate(nextWeek),
          dueTime: 12,
          timeEstimate: 15,
          actualTime: 0,
          completed: false,
          subtasks: [
            { id: 'subtask-6-1', title: 'قبض برق', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-6-2', title: 'قبض آب', completed: false, createdAt: new Date().toISOString() },
            { id: 'subtask-6-3', title: 'قبض گاز', completed: false, createdAt: new Date().toISOString() }
          ],
          notes: '',
          tags: ['مالی', 'شخصی'],
          recurring: 'monthly',
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        // ✅ کار 7: کم‌اولویت
        {
          id: 'sample-task-7',
          title: 'مرتب کردن اتاق',
          description: 'جمع کردن وسایل اضافی و گردگیری',
          projectId: 'sample-project-1',
          priority: 'low',
          status: 'todo',
          dueDate: formatDate(nextWeek),
          dueTime: 16,
          timeEstimate: 45,
          actualTime: 0,
          completed: false,
          subtasks: [],
          notes: '',
          tags: ['خانه', 'نظم'],
          recurring: 'weekly',
          recurringEndDate: null,
          parentTaskId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      availableTags: [
        'مطالعه', 'زبان', 'گرامر', 'لغت',
        'ورزش', 'کاردیو', 'صبحگاهی', 'وزنه',
        'برنامه‌نویسی', 'React', 'آموزش',
        'مالی', 'شخصی', 'خانه', 'نظم'
      ]
    }

    const dataStr = JSON.stringify(sampleData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'smart-planner-sample.json'
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()

    setTimeout(() => {
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 100)

    return { success: true, message: 'فایل نمونه دانلود شد' }
  } catch (error) {
    console.error('Error downloading sample:', error)
    return { success: false, message: 'خطا در دانلود فایل نمونه' }
  }
}

/**
 * ✅ آمار ذخیره‌سازی
 */
export const getStorageStats = () => {
  try {
    const projectsData = localStorage.getItem('smart-planner-projects')
    const tasksData = localStorage.getItem('smart-planner-tasks')

    const projectsSize = projectsData ? new Blob([projectsData]).size : 0
    const tasksSize = tasksData ? new Blob([tasksData]).size : 0
    const totalSize = projectsSize + tasksSize

    const projects = JSON.parse(projectsData || '{}').projects || []
    const tasks = JSON.parse(tasksData || '{}').tasks || []

    return {
      totalSize: (totalSize / 1024).toFixed(2),
      projectsCount: projects.length,
      tasksCount: tasks.length,
      completedTasks: tasks.filter(t => t.completed).length,
      totalTime: tasks.reduce((sum, t) => sum + (t.actualTime || 0), 0),
      totalSubtasks: tasks.reduce((sum, t) => sum + (t.subtasks?.length || 0), 0),
      totalTags: [...new Set(tasks.flatMap(t => t.tags || []))].length
    }
  } catch (error) {
    console.error('Error getting storage stats:', error)
    return {
      totalSize: '0',
      projectsCount: 0,
      tasksCount: 0,
      completedTasks: 0,
      totalTime: 0,
      totalSubtasks: 0,
      totalTags: 0
    }
  }
}

export default {
  exportData,
  importData,
  clearAllData,
  downloadSampleFile,
  getStorageStats
}