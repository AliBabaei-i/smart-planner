import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiSettings,
  FiBell,
  FiSun,
  FiCoffee,
  FiDatabase,
  FiGlobe,
  FiSmartphone,
  FiWifi,
  FiSave,
  FiDownload,
  FiUpload,
  FiTrash2,
  FiInfo,
  FiCheck,
  FiBookOpen,
  FiFileText,
  FiFolder,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiTag,
  FiCheckCircle
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import NotificationSettings from './NotificationSettings'

import PomodoroSettings from '../pomodoro/PomodoroSettings'
import DangerZone from './DangerZone'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'
import LanguageSettings from './LanguageSettings'
import { 
  exportData, 
  importData, 
  clearAllData, 
  downloadSampleFile,
  getStorageStats 
} from '../../utils/dataExport'
import { syncApi } from '../../services/syncApi'
import { syncQueue, lastSync } from '../../services/syncQueue'
import ThemeSettings from '../theme/ThemeSettings'

const SettingsPage = () => {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState('general')
  const [importStatus, setImportStatus] = useState({})
  const [exportStatus, setExportStatus] = useState({})
  const [clearConfirm, setClearConfirm] = useState(false)
  const [stats, setStats] = useState(getStorageStats())

  const tabs = [
    { id: 'general', label: t('settings.tabs.general'), Icon: FiSettings },
    { id: 'language', label: t('settings.tabs.language'), Icon: FiGlobe },
    { id: 'notifications', label: t('settings.tabs.notifications'), Icon: FiBell },
    { id: 'theme', label: t('settings.tabs.theme'), Icon: FiSun },
    { id: 'pomodoro', label: t('settings.tabs.pomodoro'), Icon: FiCoffee },
    { id: 'data', label: t('settings.tabs.data'), Icon: FiDatabase }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStorageStats())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'data') setStats(getStorageStats())
  }, [activeTab])

  const handleExport = () => {
    setExportStatus({ loading: true, message: '' })
    const result = exportData()
    setExportStatus({ loading: false, message: result.message, success: result.success })
    if (result.success) {
      toast.success(result.message, { position: "bottom-left", autoClose: 3000 })
    }
    setTimeout(() => setExportStatus({}), 4000)
  }

  const handleDownloadSample = () => {
    const result = downloadSampleFile()
    if (result.success) {
      toast.success(result.message, { position: "bottom-left", autoClose: 3000 })
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImportStatus({ loading: true, message: '' })
    
    try {
      const result = await importData(file)
      setImportStatus({ loading: false, message: result.message, success: result.success })
      toast.success(result.message, { position: "bottom-left", autoClose: 4000 })
      if (result.success) {
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch (error) {
      setImportStatus({ loading: false, message: error.message, success: false })
      toast.error(error.message, { position: "bottom-left", autoClose: 5000 })
    }
    event.target.value = ''
  }

  // ═══════════════════════════════════════════════
  // ✅ حذف همه داده‌ها — با reset سرور
  // ═══════════════════════════════════════════════
  const confirmClearData = async () => {
    setClearConfirm(false)
    
    const toastId = toast.loading('در حال حذف داده‌ها از سرور...', { position: "bottom-left" })

    try {
      // ✅ ۱. پاک کردن سرور
      try {
        const resetResult = await syncApi.reset()
        console.log('✅ Server reset:', resetResult)
      } catch (e) {
        console.warn('⚠️ Could not reset server:', e.message)
        // ادامه بده — شاید آفلاین باشه
      }

      // ✅ ۲. پاک کردن sync queue و lastSync
      try {
        syncQueue.clear()
        lastSync.clear()
      } catch (e) {
        console.warn('Queue clear error:', e)
      }

      // ✅ ۳. پاک کردن localStorage
      const result = clearAllData()

      toast.update(toastId, {
        render: 'همه داده‌ها حذف شدند — در حال بازگشت به صفحه لاگین...',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        position: "bottom-left"
      })

      // ✅ ۴. reload بعد از ۱.۵s
      setTimeout(() => window.location.reload(), 1500)

    } catch (error) {
      console.error('Clear data error:', error)
      toast.update(toastId, {
        render: 'خطا در حذف داده‌ها: ' + error.message,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        position: "bottom-left"
      })
    }
  }

  // ✅ راهنما
  const helpItems = [
    { Icon: FiFolder, labelKey: 'nav.projects', descKey: 'projects.subtitle', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { Icon: FiCalendar, labelKey: 'nav.planning', descKey: 'planning.subtitle', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { Icon: FiBarChart2, labelKey: 'nav.analytics', descKey: 'analytics.subtitle', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { Icon: FiAward, labelKey: 'nav.achievements', descKey: 'achievements.subtitle', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { Icon: FiCoffee, labelKey: 'pomodoro.title', descKey: 'pomodoro.settings.tipDesc', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
    { Icon: FiTag, labelKey: 'tasks.form.tags', descKey: 'tasks.form.subtaskHint', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' }
  ]

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-blue-600" size={26} />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* تب‌ها */}
      <Card className="p-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {tabs.map(tab => {
            const IconComponent = tab.Icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                  active
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* تب عمومی */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiSettings size={20} className="text-blue-600" />
              <span>{t('settings.general.title')}</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FiSave size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t('settings.general.autoSave')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('settings.general.autoSaveDesc')}</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <FiCheck size={16} />
                  <span>{t('settings.general.enabled')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <FiSmartphone size={20} className="text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t('settings.general.pwa')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('settings.general.pwaDesc')}</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <FiCheck size={16} />
                  <span>{t('settings.general.enabled')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FiWifi size={20} className="text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t('settings.general.offline')}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{t('settings.general.offlineDesc')}</div>
                  </div>
                </div>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                  <FiCheck size={16} />
                  <span>{t('settings.general.enabled')}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
    <FiInfo size={20} className="text-blue-600" />
    <span>{t('settings.about.title')}</span>
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.version')}:</span>
        <span className="font-medium text-gray-900 dark:text-white text-sm">2.1.0 (TypeScript)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.developer')}:</span>
        <span className="font-medium text-gray-900 dark:text-white text-sm">{t('settings.about.developerName')}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.tech')}:</span>
        <span className="font-medium text-gray-900 dark:text-white text-sm">React 18 + Redux + Vite</span>
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.storage')}:</span>
        <span className="font-medium text-emerald-600 dark:text-emerald-400 text-sm">IndexedDB (Offline-First)</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.support')}:</span>
        <span className="font-medium text-gray-900 dark:text-white text-sm">PWA + Multi-Device Sync</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600 dark:text-gray-400 text-sm">{t('settings.about.theme')}:</span>
        <span className="font-medium text-gray-900 dark:text-white text-sm">Light / Dark / System</span>
      </div>
    </div>
  </div>
</Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiBookOpen size={20} className="text-blue-600" />
              <span>{t('settings.help.title')}</span>
            </h3>
            <div className="space-y-3">
              {helpItems.map((item, index) => {
                const IconComponent = item.Icon
                return (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <IconComponent size={20} className={item.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {t(item.labelKey)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {t(item.descKey)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <KeyboardShortcutsHelp />
        </div>
      )}

      {activeTab === 'language' && <LanguageSettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
      {activeTab === 'pomodoro' && <PomodoroSettings />}
      
      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiDatabase size={20} className="text-blue-600" />
              <span>{t('settings.data.statsTitle')}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="w-10 h-10 mx-auto bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-2">
                  <FiFolder size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.projectsCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('settings.data.projects')}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-10 h-10 mx-auto bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-2">
                  <FiCheckCircle size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.tasksCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('settings.data.tasks')}</div>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="w-10 h-10 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-2">
                  <FiCheck size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.completedTasks}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{t('settings.data.completed')}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="w-10 h-10 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-lg flex items-center justify-center mb-2">
                  <FiDatabase size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.totalSize}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">KB</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 border-dashed border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <FiDownload size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {t('settings.data.sample.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {t('settings.data.sample.description')}
                </p>
                <Button onClick={handleDownloadSample} variant="primary">
                  <FiDownload size={16} />
                  <span>{t('settings.data.sample.download')}</span>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiDatabase size={20} className="text-blue-600" />
              <span>{t('settings.data.manage.title')}</span>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <FiUpload size={16} className="text-blue-600" />
                    <span>{t('settings.data.manage.export')}</span>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('settings.data.manage.exportDesc')}
                  </p>
                </div>
                <Button onClick={handleExport} loading={exportStatus.loading} variant="primary">
                  <FiUpload size={16} />
                  <span>{t('actions.export')}</span>
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    <FiDownload size={16} className="text-green-600" />
                    <span>{t('settings.data.manage.import')}</span>
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {t('settings.data.manage.importDesc')}
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImport}
                    accept=".json,application/json"
                    className="hidden"
                  />
                  <Button onClick={() => fileInputRef.current?.click()} loading={importStatus.loading} variant="primary">
                    <FiDownload size={16} />
                    <span>{t('actions.import')}</span>
                  </Button>
                </div>
              </div>

              {/* ✅ دکمه حذف اول — با reset سرور */}
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20 flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <h4 className="font-medium text-red-900 dark:text-red-100 text-sm flex items-center gap-2">
                    <FiTrash2 size={16} />
                    <span>{t('settings.data.manage.clear')}</span>
                  </h4>
                  <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                    {t('settings.data.manage.clearDesc')}
                  </p>
                </div>
                <Button onClick={() => setClearConfirm(true)} variant="danger">
                  <FiTrash2 size={16} />
                  <span>{t('actions.delete')}</span>
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiFileText size={20} className="text-blue-600" />
              <span>{t('settings.data.guide.title')}</span>
            </h3>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="font-semibold text-gray-900 dark:text-white mb-2 text-xs">
                  {t('settings.data.guide.structure')}
                </div>
                <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto" dir="ltr">
{`{
  "version": "2.0",
  "projects": [...],
  "tasks": [...]
}`}
                </pre>
              </div>
              <div className="flex items-start gap-2">
                <FiCheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('settings.data.guide.method1')}</strong> {t('settings.data.guide.method1Desc')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <FiCheckCircle size={14} className="text-green-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('settings.data.guide.method2')}</strong> {t('settings.data.guide.method2Desc')}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <FiInfo size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>{t('settings.data.guide.warning')}</strong> {t('settings.data.guide.warningDesc')}
                </span>
              </div>
            </div>
          </Card>

          {/* ⚠️ DangerZone هم باید reset سرور رو صدا بزنه */}
          <DangerZone />
        </div>
      )}

      <ConfirmDialog
        isOpen={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={confirmClearData}
        title={t('settings.data.manage.clear')}
        message={t('settings.data.manage.clearDesc')}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
      />
    </div>
  )
}

export default SettingsPage