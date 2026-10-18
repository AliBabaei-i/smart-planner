// frontend/src/services/exportService.ts
import { toast } from 'react-toastify'
import i18n from '../i18n/config'
import { formatDateByLang, formatTimeByLang, formatDateTimeByLang } from '../utils/formatters'

class ExportService {
  downloadBlob(blob: Blob, filename: string): boolean {
    try {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 100)
      return true
    } catch (error) {
      console.error('Download error:', error)
      return false
    }
  }

  async exportToExcel(projects: any[], tasks: any[]): Promise<boolean> {
    try {
      // ✅ بارگذاری داینامیک xlsx (فقط وقتی کاربر کلیک کرد)
      const { utils, write } = await import('xlsx')

      const workbook = utils.book_new()
      const projectsData = projects.map(project => {
        const projectTasks = tasks.filter(task => task.projectId === project.id)
        const completedTasks = projectTasks.filter(task => task.completed).length
        return {
          'نام پروژه': project.name,
          'توضیحات': project.description || '-',
          'تعداد کارها': projectTasks.length,
          'کارهای انجام شده': completedTasks,
          'درصد پیشرفت': projectTasks.length > 0 ? `${Math.round((completedTasks / projectTasks.length) * 100)}%` : '0%',
          'تاریخ ایجاد': formatDateByLang(project.createdAt)
        }
      })

      if (projectsData.length > 0) {
        const projectsSheet = utils.json_to_sheet(projectsData)
        utils.book_append_sheet(workbook, projectsSheet, 'پروژه‌ها')
      }

      const tasksData = tasks.map(task => {
        const project = projects.find(p => p.id === task.projectId)
        return {
          'عنوان': task.title,
          'توضیحات': task.description || '-',
          'پروژه': project?.name || '-',
          'وضعیت': task.completed ? 'انجام شده' : 'در انتظار',
          'تاریخ انجام': task.dueDate ? formatDateByLang(task.dueDate) : '-',
          'زمان واقعی': task.actualTime ? formatTimeByLang(task.actualTime) : '-'
        }
      })

      if (tasksData.length > 0) {
        const tasksSheet = utils.json_to_sheet(tasksData)
        utils.book_append_sheet(workbook, tasksSheet, 'کارها')
      }

      const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      this.downloadBlob(blob, `smart-planner-${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success(i18n.t('notifications.exportSuccess') || 'گزارش Excel ایجاد شد')
      return true
    } catch (error: any) {
      toast.error('خطا در ایجاد Excel: ' + error.message)
      return false
    }
  }

  async exportToPDF(elementId: string = 'analytics-content'): Promise<boolean> {
    try {
      // ✅ بارگذاری داینامیک html2canvas و jspdf
      const html2canvas = (await import('html2canvas')).default
      const jsPDF = (await import('jspdf')).default

      const element = document.getElementById(elementId)
      if (!element) throw new Error('Element not found')

      toast.info('در حال ایجاد PDF...', { position: 'bottom-left', autoClose: 2000 })

      const canvas = await html2canvas(element, { scale: 2, useCORS: true })
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

      const pdfBlob = pdf.output('blob')
      this.downloadBlob(pdfBlob, `smart-planner-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
      toast.success('PDF با موفقیت ایجاد شد', { position: 'bottom-left', autoClose: 3000 })
      return true
    } catch (error: any) {
      toast.error('خطا در ایجاد PDF: ' + error.message)
      return false
    }
  }
}

export const exportService = new ExportService()
export default exportService