import { utils, write } from 'xlsx'
import { toast } from 'react-toastify'
import i18n from '../i18n/config'
import { formatDateByLang, formatTimeByLang, formatDateTimeByLang } from '../utils/formatters'

class ExportService {
  // ✅ تابع کمکی برای دانلود مطمئن
  downloadBlob(blob, filename) {
    try {
      // روش ۱: استفاده از URL.createObjectURL
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'

      // اضافه به DOM
      document.body.appendChild(link)

      // کلیک
      link.click()

      // پاک‌سازی
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)

      return true
    } catch (error) {
      console.error('Download error:', error)

      // روش ۲ (Fallback): استفاده از msSaveBlob برای IE/Edge قدیمی
      if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(blob, filename)
        return true
      }

      // روش ۳: باز کردن در تب جدید
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')

      return false
    }
  }

  // ✅ Export به Excel - روش مطمئن
  async exportToExcel(projects, tasks) {
    try {
      // ✅ ایجاد workbook
      const workbook = utils.book_new()

      // ورق پروژه‌ها
      const projectsData = projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id)
        const completedTasks = projectTasks.filter(task => task.completed).length

        return {
          'نام پروژه': project.name,
          'توضیحات': project.description || '-',
          'تعداد کارها': projectTasks.length,
          'کارهای انجام شده': completedTasks,
          'درصد پیشرفت': projectTasks.length > 0
            ? `${Math.round((completedTasks / projectTasks.length) * 100)}%`
            : '0%',
          'تاریخ ایجاد': formatDateByLang(project.createdAt)
        }
      })

      if (projectsData.length > 0) {
        const projectsSheet = utils.json_to_sheet(projectsData)
        projectsSheet['!cols'] = [
          { wch: 25 }, { wch: 40 }, { wch: 12 },
          { wch: 15 }, { wch: 12 }, { wch: 15 }
        ]
        utils.book_append_sheet(workbook, projectsSheet, 'پروژه‌ها')
      }

      // ورق کارها
      const tasksData = tasks.map(task => {
        const project = projects.find(p => p.id === task.projectId)

        return {
          'عنوان': task.title,
          'توضیحات': task.description || '-',
          'پروژه': project?.name || '-',
          'اولویت': this.getPriorityText(task.priority),
          'وضعیت': task.completed ? 'انجام شده' : 'در انتظار',
          'تاریخ انجام': task.dueDate ? formatDateByLang(task.dueDate) : '-',
          'کار زمان  ': task.timeEstimate ? formatTimeByLang(task.timeEstimate) : '-',
          'زمان واقعی': task.actualTime ? formatTimeByLang(task.actualTime) : '-',
          'تگ‌ها': (task.tags || []).join(', ') || '-',
          'تاریخ ایجاد': formatDateByLang(task.createdAt)
        }
      })

      if (tasksData.length > 0) {
        const tasksSheet = utils.json_to_sheet(tasksData)
        tasksSheet['!cols'] = [
          { wch: 30 }, { wch: 40 }, { wch: 20 }, { wch: 10 },
          { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 },
          { wch: 20 }, { wch: 15 }
        ]
        utils.book_append_sheet(workbook, tasksSheet, 'کارها')
      }

      // ورق آمار
      const statsData = [this.generateStats(projects, tasks)]
      const statsSheet = utils.json_to_sheet(statsData)
      statsSheet['!cols'] = [{ wch: 25 }, { wch: 30 }]
      utils.book_append_sheet(workbook, statsSheet, 'آمار کلی')

      // ✅ تولید فایل به صورت ArrayBuffer با MIME type درست
      const excelBuffer = write(workbook, {
        bookType: 'xlsx',
        type: 'array'
      })

      // ✅ ساخت Blob با MIME type صحیح
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })

      const filename = `smart-planner-${new Date().toISOString().split('T')[0]}.xlsx`

      // ✅ دانلود با روش مطمئن
      const success = this.downloadBlob(blob, filename)

      if (success) {
        toast.success(i18n.t('notifications.exportSuccess') || 'گزارش Excel با موفقیت ایجاد شد', {
          position: "bottom-left",
          autoClose: 3000,
        })
      }

      return true
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      toast.error('خطا در ایجاد Excel: ' + error.message, {
        position: "bottom-left",
        autoClose: 5000,
      })
      return false
    }
  }

  // ✅ Export به PDF
  async exportToPDF(projects, tasks, elementId = 'analytics-content') {
    try {
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error('Element not found')
      }

      toast.info('در حال ایجاد PDF...', {
        position: "bottom-left",
        autoClose: 2000,
      })

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        onclone: (clonedDoc) => {
          // ✅ رفع مشکلات استایل در clone
          const style = clonedDoc.createElement('style')
          style.textContent = `
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          `
          clonedDoc.head.appendChild(style)
        }
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // ✅ ساخت Blob از PDF
      const pdfBlob = pdf.output('blob')
      const filename = `smart-planner-report-${new Date().toISOString().split('T')[0]}.pdf`

      this.downloadBlob(pdfBlob, filename)

      toast.success('PDF با موفقیت ایجاد شد', {
        position: "bottom-left",
        autoClose: 3000,
      })

      return true
    } catch (error) {
      console.error('Error exporting to PDF:', error)
      toast.error('خطا در ایجاد PDF: ' + error.message, {
        position: "bottom-left",
        autoClose: 5000,
      })
      return false
    }
  }

  // ✅ Export به JSON
  exportToJSON(projects, tasks) {
    try {
      const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        exportType: 'full',
        metadata: {
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(task => task.completed).length,
          totalTime: tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
        },
        projects: projects,
        tasks: tasks
      }

      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], {
        type: 'application/json;charset=utf-8'
      })

      const filename = `smart-planner-backup-${new Date().toISOString().split('T')[0]}.json`

      this.downloadBlob(blob, filename)

      toast.success('Backup JSON با موفقیت ایجاد شد', {
        position: "bottom-left",
        autoClose: 3000,
      })

      return true
    } catch (error) {
      console.error('Error exporting to JSON:', error)
      toast.error('خطا در ایجاد Backup', {
        position: "bottom-left",
        autoClose: 5000,
      })
      return false
    }
  }

  // ✅ گزارش خلاصه
  exportSummaryReport(projects, tasks) {
    try {
      const summary = this.generateStats(projects, tasks)
      const summaryText = Object.entries(summary)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      // ✅ اضافه کردن BOM برای UTF-8
      const blob = new Blob(['\ufeff' + summaryText], {
        type: 'text/plain;charset=utf-8'
      })

      const filename = `smart-planner-summary-${new Date().toISOString().split('T')[0]}.txt`

      this.downloadBlob(blob, filename)

      toast.success('گزارش خلاصه ایجاد شد', {
        position: "bottom-left",
        autoClose: 3000,
      })

      return true
    } catch (error) {
      console.error('Error creating summary:', error)
      return false
    }
  }

  // ✅ CSV Export
  exportToCSV(projects, tasks) {
    try {
      const csvData = tasks.map(task => {
        const project = projects.find(p => p.id === task.projectId)
        return {
          'عنوان': task.title,
          'پروژه': project?.name || '-',
          'اولویت': this.getPriorityText(task.priority),
          'وضعیت': task.completed ? 'انجام شده' : 'در انتظار',
          'تاریخ انجام': task.dueDate ? formatDateByLang(task.dueDate) : '-',
          'زمان واقعی': task.actualTime || 0,
        }
      })

      const ws = utils.json_to_sheet(csvData)
      const csv = utils.sheet_to_csv(ws)

      // ✅ BOM برای UTF-8 در Excel
      const blob = new Blob(['\ufeff' + csv], {
        type: 'text/csv;charset=utf-8;'
      })

      const filename = `smart-planner-tasks-${new Date().toISOString().split('T')[0]}.csv`

      this.downloadBlob(blob, filename)

      toast.success('CSV با موفقیت ایجاد شد', {
        position: "bottom-left",
        autoClose: 3000,
      })

      return true
    } catch (error) {
      console.error('Error exporting CSV:', error)
      return false
    }
  }

  // ✅ تولید آمار کلی
  generateStats(projects, tasks) {
    const completedTasks = tasks.filter(task => task.completed).length
    const totalTimeEstimated = tasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0)
    const totalTimeActual = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)
    const timeEfficiency = totalTimeEstimated > 0
      ? Math.round((totalTimeActual / totalTimeEstimated) * 100)
      : 0

    return {
      'تاریخ گزارش': formatDateTimeByLang(new Date().toISOString()),
      'تعداد کل پروژه‌ها': projects.length,
      'تعداد کل کارها': tasks.length,
      'کارهای انجام شده': completedTasks,
      'کارهای در انتظار': tasks.length - completedTasks,
      'نرخ تکمیل': `${tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%`,
      'زمان کلکار ': formatTimeByLang(totalTimeEstimated),
      'زمان کل واقعی': formatTimeByLang(totalTimeActual),
      'میانگین بهره‌وری': `${timeEfficiency}%`,
      'پروژه‌های فعال': projects.filter(p =>
        tasks.some(t => t.projectId === p.id && !t.completed)
      ).length,
      'کارهای امروز': tasks.filter(t => {
        if (!t.dueDate) return false
        return new Date(t.dueDate).toDateString() === new Date().toDateString()
      }).length,
      'کارهای تکرارشونده': tasks.filter(t => t.recurring && !t.parentTaskId).length,
      'تعداد تگ‌های استفاده شده': [...new Set(tasks.flatMap(t => t.tags || []))].length
    }
  }

  getPriorityText(priority) {
    const priorities = {
      'high': 'بالا',
      'medium': 'متوسط',
      'low': 'کم'
    }
    return priorities[priority] || priority
  }

  getRecurringText(recurring) {
    const types = {
      'daily': 'روزانه',
      'weekly': 'هفتگی',
      'monthly': 'ماهانه'
    }
    return types[recurring] || recurring
  }
}

export const exportService = new ExportService()
export default exportService