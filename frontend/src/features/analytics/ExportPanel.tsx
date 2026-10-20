import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiFileText, FiDownload, FiLoader, FiFolder, FiCheckCircle, FiClock, FiPrinter
} from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { exportService } from '../../services/exportService'
import { formatTimeByLang } from '../../utils/formatters'
import type { RootState } from '../../app/store'

type ExportType = 'excel' | 'pdf'

const ExportPanel = () => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector((state: RootState) => state.projects)
  const { tasks = [] } = useSelector((state: RootState) => state.tasks)
  const [exportingType, setExportingType] = useState<ExportType | null>(null)

  const handleExport = async (type: ExportType) => {
    if (projects.length === 0 && tasks.length === 0) {
      toast.error(t('tasks.empty'), { position: "bottom-left", autoClose: 3000 })
      return
    }

    setExportingType(type)
    try {
      if (type === 'excel') {
        await exportService.exportToExcel(projects, tasks)
      } else if (type === 'pdf') {
        await exportService.exportToPDF('analytics-content')
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setTimeout(() => setExportingType(null), 1500)
    }
  }

  const exportOptions = [
    {
      type: 'excel' as ExportType,
      title: t('exportOptions.excel.title') || 'Excel',
      description: t('exportOptions.excel.description') || 'خروجی اکسل از پروژه‌ها و کارها',
      Icon: FiFileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      type: 'pdf' as ExportType,
      title: t('exportOptions.pdf.title') || 'PDF',
      description: t('exportOptions.pdf.description') || 'خروجی تصویری از داشبورد تحلیل‌ها',
      Icon: FiPrinter,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    }
  ]

  const totalTime = tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <FiDownload size={20} className="text-blue-600" />
          <span>{t('analytics.tabs.export')}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
          {exportOptions.map(option => {
            const isExporting = exportingType === option.type
            return (
              <div key={option.type} className={`p-4 border-2 rounded-xl transition-all hover:shadow-md ${option.bgColor} ${option.borderColor}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm flex-shrink-0">
                    {isExporting ? <FiLoader size={24} className={`${option.color} animate-spin`} /> : <option.Icon size={24} className={option.color} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-bold text-base ${option.color}`}>{option.title}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{option.description}</div>
                  </div>
                </div>
                <Button onClick={() => handleExport(option.type)} loading={isExporting} disabled={!!exportingType} variant="secondary" size="small" className="w-full">
                  <FiDownload size={16} />
                  <span>{isExporting ? 'در حال ساخت...' : t('actions.export')}</span>
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-6">
        <h4 className="text-md font-semibold mb-4 text-gray-900 dark:text-white">
          {t('settings.data.statsTitle') || 'آمار کلی'}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <FiFolder size={20} className="text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
            <div className="text-xs text-gray-600 mt-1">{t('nav.projects')}</div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <FiCheckCircle size={20} className="text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{tasks.length}</div>
            <div className="text-xs text-gray-600 mt-1">{t('nav.tasks')}</div>
          </div>
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <FiCheckCircle size={20} className="text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-600">{tasks.filter(t => t.completed).length}</div>
            <div className="text-xs text-gray-600 mt-1">{t('settings.data.completed')}</div>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <FiClock size={20} className="text-orange-600 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-600">{formatTimeByLang(totalTime)}</div>
            <div className="text-xs text-gray-600 mt-1">{t('analytics.cards.effectiveTime')}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ExportPanel