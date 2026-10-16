import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiFileText,
  FiDownload,
  FiArchive,
  FiSave,
  FiLoader,
  FiFolder,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import { exportService } from '../../services/exportService'
import { formatTimeByLang } from '../../utils/formatters'

const ExportPanel = () => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)
  const [exportingType, setExportingType] = useState(null)

  const handleExport = async (type) => {
    if (projects.length === 0 && tasks.length === 0) {
      toast.error(t('tasks.empty'), {
        position: "bottom-left",
        autoClose: 3000,
      })
      return
    }

    setExportingType(type)

    try {
      switch (type) {
        case 'excel':
          await exportService.exportToExcel(projects, tasks)
          break
        case 'pdf':
          await exportService.exportToPDF(projects, tasks, 'analytics-content')
          break
        case 'json':
          exportService.exportToJSON(projects, tasks)
          break
        case 'summary':
          exportService.exportSummaryReport(projects, tasks)
          break
        case 'csv':
          exportService.exportToCSV(projects, tasks)
          break
        default:
          break
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setTimeout(() => setExportingType(null), 1500)
    }
  }

  const exportOptions = [
    {
      type: 'excel',
      title: t('exportOptions.excel.title'),
      description: t('exportOptions.excel.description'),
      Icon: FiFileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    },
    {
      type: 'pdf',
      title: t('exportOptions.pdf.title'),
      description: t('exportOptions.pdf.description'),
      Icon: FiFileText,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800'
    },
    {
      type: 'json',
      title: t('exportOptions.json.title'),
      description: t('exportOptions.json.description'),
      Icon: FiArchive,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800'
    },
    {
      type: 'summary',
      title: t('exportOptions.summary.title'),
      description: t('exportOptions.summary.description'),
      Icon: FiSave,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800'
    },
    {
      type: 'csv',
      title: t('exportOptions.csv.title'),
      description: t('exportOptions.csv.description'),
      Icon: FiFileText,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800'
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exportOptions.map(option => {
            const IconComponent = option.Icon
            const isExporting = exportingType === option.type
            
            return (
              <div
                key={option.type}
                className={`p-4 border-2 rounded-xl transition-all hover:shadow-md ${option.bgColor} ${option.borderColor}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm flex-shrink-0">
                    {isExporting ? (
                      <FiLoader size={20} className={`${option.color} animate-spin`} />
                    ) : (
                      <IconComponent size={20} className={option.color} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm ${option.color}`}>
                      {option.title}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </div>
                  </div>
                </div>
                
                <Button
                  onClick={() => handleExport(option.type)}
                  loading={isExporting}
                  disabled={!!exportingType}
                  variant="secondary"
                  size="small"
                  className="w-full"
                >
                  <FiDownload size={14} />
                  <span>{isExporting ? '...' : t('actions.export')}</span>
                </Button>
              </div>
            )
          })}
        </div>
      </Card>

      {/* آمار سریع */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <FiCheckCircle size={20} className="text-blue-600" />
          <span>{t('settings.data.statsTitle')}</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
            <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
              <FiFolder size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {projects.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('nav.projects')}
            </div>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
            <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-2">
              <FiCheckCircle size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {tasks.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('nav.tasks')}
            </div>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
            <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-2">
              <FiCheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {tasks.filter(t => t.completed).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('settings.data.completed')}
            </div>
          </div>
          
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
            <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-2">
              <FiClock size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {formatTimeByLang(totalTime)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {t('analytics.cards.effectiveTime')}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ExportPanel