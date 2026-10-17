import { toast } from 'react-toastify'

export const exportData = (): { success: boolean; message: string } => {
  try {
    const projectsData = JSON.parse(localStorage.getItem('smart-planner-projects') || '{}')
    const tasksData = JSON.parse(localStorage.getItem('smart-planner-tasks') || '{}')
    const notificationsData = JSON.parse(localStorage.getItem('smart-planner-notifications') || '{}')
    const themeData = JSON.parse(localStorage.getItem('smart-planner-theme') || '{}')
    const pomodoroData = JSON.parse(localStorage.getItem('smart-planner-pomodoro') || '{}')
    const achievementsData = JSON.parse(localStorage.getItem('smart-planner-achievements') || '{}')
    const dashboardData = JSON.parse(localStorage.getItem('smart-planner-dashboard-layout') || '[]')

    const exportPayload = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      exportType: 'full',
      metadata: {
        appName: 'Smart Planner',
        appVersion: '2.1.0',
        totalProjects: projectsData.projects?.length || 0,
        totalTasks: tasksData.tasks?.length || 0,
        completedTasks: tasksData.tasks?.filter((t: any) => t.completed).length || 0,
        totalTime: tasksData.tasks?.reduce((sum: number, t: any) => sum + (t.actualTime || 0), 0) || 0,
        availableTags: tasksData.availableTags || []
      },
      projects: projectsData.projects || [],
      tasks: tasksData.tasks || [],
      availableTags: tasksData.availableTags || [],
      settings: {
        theme: themeData,
        notifications: notificationsData,
        pomodoro: pomodoroData,
        achievements: achievementsData,
        dashboard: dashboardData
      }
    }

    const dataStr = JSON.stringify(exportPayload, null, 2)
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

export const importData = (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string)
        if (!importedData.projects || !Array.isArray(importedData.projects)) {
          throw new Error('فایل باید شامل آرایه "projects" باشد')
        }
        if (!importedData.tasks || !Array.isArray(importedData.tasks)) {
          throw new Error('فایل باید شامل آرایه "tasks" باشد')
        }
        // ... (بقیه منطق پردازش و ذخیره در localStorage مثل قبل) ...
        resolve({ success: true, message: `با موفقیت import شد` })
      } catch (error: any) {
        reject({ success: false, message: error.message || 'خطا در import فایل' })
      }
    }

    reader.onerror = () => reject({ success: false, message: 'خطا در خواندن فایل' })
    reader.readAsText(file, 'UTF-8')
  })
}

export const clearAllData = (): { success: boolean; message: string } => {
  try {
    const keys = [
      'smart-planner-projects', 'smart-planner-tasks', 'smart-planner-notifications',
      'smart-planner-auth', 'smart-planner-theme', 'smart-planner-theme-mode',
      'smart-planner-theme-colors', 'smart-planner-theme-settings', 'smart-planner-pomodoro',
      'smart-planner-pomodoro-stats', 'smart-planner-pomodoro-settings',
      'smart-planner-achievements', 'smart-planner-dashboard-layout',
      'smart-planner-primary-color', 'welcome-shown'
    ]
    keys.forEach(k => localStorage.removeItem(k))
    return { success: true, message: 'تمام داده‌ها پاک شدند' }
  } catch (error) {
    return { success: false, message: 'خطا در پاک کردن داده‌ها' }
  }
}

export const downloadSampleFile = (): { success: boolean; message: string } => {
  // ... منطق دانلود فایل نمونه (نیازی به تغییر ندارد)
  return { success: true, message: 'فایل نمونه دانلود شد' }
}

export const getStorageStats = () => {
  try {
    const projectsData = localStorage.getItem('smart-planner-projects')
    const tasksData = localStorage.getItem('smart-planner-tasks')
    const projects = JSON.parse(projectsData || '{}').projects || []
    const tasks = JSON.parse(tasksData || '{}').tasks || []
    return {
      totalSize: ((projectsData?.length || 0) + (tasksData?.length || 0)) / 1024,
      projectsCount: projects.length,
      tasksCount: tasks.length,
      completedTasks: tasks.filter((t: any) => t.completed).length,
      totalTime: tasks.reduce((sum: number, t: any) => sum + (t.actualTime || 0), 0),
      totalSubtasks: tasks.reduce((sum: number, t: any) => sum + (t.subtasks?.length || 0), 0),
      totalTags: [...new Set(tasks.flatMap((t: any) => t.tags || []))].length
    }
  } catch {
    return { totalSize: 0, projectsCount: 0, tasksCount: 0, completedTasks: 0, totalTime: 0, totalSubtasks: 0, totalTags: 0 }
  }
}