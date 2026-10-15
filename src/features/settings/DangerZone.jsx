import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiAlertTriangle,
  FiSliders,
  FiFolder,
  FiCheckSquare,
  FiTrash2
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { syncApi } from '../../services/syncApi'
import { syncQueue, lastSync } from '../../services/syncQueue'

const DangerZone = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [confirmType, setConfirmType] = useState(null)
  const [isResetting, setIsResetting] = useState(false)

  const handleReset = (type) => {
    setConfirmType(type)
  }

  const confirmReset = async () => {
    if (isResetting) return
    setIsResetting(true)

    const toastId = toast.loading(
      t('settings.dangerZone.resetting') || 'در حال حذف داده‌ها از سرور...',
      { position: "bottom-left" }
    )

    try {
      switch (confirmType) {
        case 'all': {
          // ✅ ۱. سرور
          try {
            await syncApi.reset()
            console.log('✅ Server reset (all)')
          } catch (e) {
            console.warn('⚠️ Server reset failed:', e.message)
          }
          // ✅ ۲. Queue + lastSync
          syncQueue.clear()
          lastSync.clear()
          // ✅ ۳. localStorage کامل
          localStorage.clear()
          break
        }

        case 'tasks': {
          // ✅ سرور — فقط tasks
          try {
            await syncApi.reset('tasks')
            console.log('✅ Server reset (tasks)')
          } catch (e) {
            console.warn('⚠️ Server reset tasks failed:', e.message)
          }
          // ✅ local
          localStorage.removeItem('smart-planner-tasks')
          localStorage.removeItem('smart-planner-achievements')
          break
        }

        case 'projects': {
          // ✅ سرور — فقط projects
          try {
            await syncApi.reset('projects')
            console.log('✅ Server reset (projects)')
          } catch (e) {
            console.warn('⚠️ Server reset projects failed:', e.message)
          }
          // ✅ local
          localStorage.removeItem('smart-planner-projects')
          break
        }

        case 'settings': {
          // ✅ فقط local (سرور کاری نداره)
          localStorage.removeItem('smart-planner-theme')
          localStorage.removeItem('smart-planner-notifications')
          localStorage.removeItem('smart-planner-pomodoro-settings')
          localStorage.removeItem('smart-planner-dashboard-layout')
          break
        }

        default:
          break
      }

      // ✅ پیام موفق
      const successKey = confirmType === 'all'
        ? 'settings.dangerZone.clearAll'
        : `settings.dangerZone.reset${confirmType.charAt(0).toUpperCase() + confirmType.slice(1)}`

      toast.update(toastId, {
        render: t(successKey) || 'داده‌ها با موفقیت حذف شد',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        position: "bottom-left"
      })

      // ✅ reload بعد از ۱.۵s
      setTimeout(() => window.location.reload(), 1500)

    } catch (error) {
      console.error('Reset error:', error)
      toast.update(toastId, {
        render: 'خطا در حذف داده‌ها: ' + error.message,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        position: "bottom-left"
      })
    } finally {
      setIsResetting(false)
      setConfirmType(null)
    }
  }

  const getConfirmMessage = () => {
    switch (confirmType) {
      case 'all':
        return t('confirm.clearDataMessage')
      case 'tasks':
        return t('settings.dangerZone.resetTasksDesc')
      case 'projects':
        return t('settings.dangerZone.resetProjectsDesc')
      case 'settings':
        return t('settings.dangerZone.resetSettingsDesc')
      default:
        return ''
    }
  }

  const dangerOptions = [
    {
      id: 'settings',
      labelKey: 'settings.dangerZone.resetSettings',
      descKey: 'settings.dangerZone.resetSettingsDesc',
      Icon: FiSliders,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      buttonText: t('settings.dangerZone.resetButton'),
      buttonVariant: 'secondary'
    },
    {
      id: 'projects',
      labelKey: 'settings.dangerZone.resetProjects',
      descKey: 'settings.dangerZone.resetProjectsDesc',
      Icon: FiFolder,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      buttonText: t('settings.dangerZone.deleteButton'),
      buttonVariant: 'secondary'
    },
    {
      id: 'tasks',
      labelKey: 'settings.dangerZone.resetTasks',
      descKey: 'settings.dangerZone.resetTasksDesc',
      Icon: FiCheckSquare,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
      buttonText: t('settings.dangerZone.deleteButton'),
      buttonVariant: 'secondary'
    }
  ]

  return (
    <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10">
      <h3 className="text-lg font-semibold mb-4 text-red-900 dark:text-red-100 flex items-center space-x-2 space-x-reverse">
        <FiAlertTriangle size={20} />
        <span>{t('settings.dangerZone.title')}</span>
      </h3>
      <p className="text-sm text-red-600 dark:text-red-300 mb-4">
        {t('settings.dangerZone.description')}
      </p>

      <div className="space-y-3">
        {dangerOptions.map(option => {
          const IconComponent = option.Icon
          return (
            <div
              key={option.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg flex-wrap gap-3"
            >
              <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-[200px]">
                <div className={`w-10 h-10 ${option.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <IconComponent size={20} className={option.color} />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {t(option.labelKey)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t(option.descKey)}
                  </div>
                </div>
              </div>
              <Button
                variant={option.buttonVariant}
                size="small"
                onClick={() => handleReset(option.id)}
                disabled={isResetting}
              >
                {option.buttonText}
              </Button>
            </div>
          )
        })}

        {/* حذف کامل */}
        <div className="flex items-center justify-between p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-300 dark:border-red-700 flex-wrap gap-3">
          <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-[200px]">
            <div className="w-10 h-10 bg-red-200 dark:bg-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FiTrash2 size={20} className="text-red-700 dark:text-red-300" />
            </div>
            <div>
              <div className="font-bold text-red-900 dark:text-red-100 text-sm">
                {t('settings.dangerZone.clearAll')}
              </div>
              <div className="text-xs text-red-600 dark:text-red-300">
                {t('settings.dangerZone.clearAllDesc')}
              </div>
            </div>
          </div>
          <Button
            variant="danger"
            size="small"
            onClick={() => handleReset('all')}
            disabled={isResetting}
          >
            {t('settings.dangerZone.deleteButton')}
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmType}
        onClose={() => setConfirmType(null)}
        onConfirm={confirmReset}
        title={t('actions.confirm')}
        message={getConfirmMessage()}
        confirmText={t('settings.dangerZone.confirmDelete')}
        cancelText={t('actions.cancel')}
        variant="danger"
        Icon={FiAlertTriangle}
      />
    </Card>
  )
}

export default DangerZone