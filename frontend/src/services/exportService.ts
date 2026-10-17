import { utils, write } from 'xlsx'
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
      const workbook = utils.book_new()
      // ... (منطق مشابه کد قبلی برای پروژه‌ها، کارها و آمار)
      const excelBuffer = write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const filename = `smart-planner-${new Date().toISOString().split('T')[0]}.xlsx`
      this.downloadBlob(blob, filename)
      toast.success(i18n.t('notifications.exportSuccess') || 'گزارش Excel ایجاد شد')
      return true
    } catch (error: any) {
      toast.error('خطا در ایجاد Excel: ' + error.message)
      return false
    }
  }

  async exportToPDF(projects: any[], tasks: any[], elementId: string = 'analytics-content'): Promise<boolean> {
    // ... منطق مشابه قبلی، با import پویا (dynamic import) برای html2canvas و jspdf
    return true
  }

  exportToJSON(projects: any[], tasks: any[]): boolean {
    // ... منطق مشابه قبلی
    return true
  }

  exportToCSV(projects: any[], tasks: any[]): boolean {
    // ... منطق مشابه قبلی
    return true
  }
}

export const exportService = new ExportService()
export default exportService