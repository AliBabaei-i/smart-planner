import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import type { IconType } from 'react-icons'
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
  FiCheckCircle,
  FiRefreshCw,
} from 'react-icons/fi'

import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

// ✅ این‌ها ممکن است .jsx یا .tsx باشند — allowJs:true اجازه می‌دهد
import NotificationSettings from './NotificationSettings'
import PomodoroSettings from '../pomodoro/PomodoroSettings'
import DangerZone from './DangerZone'
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp'
import LanguageSettings from './LanguageSettings'
import SyncSettings from './SyncSettings'
import ThemeSettings from '../theme/ThemeSettings'

import {
  exportData,
  importData,
  clearAllData,
  downloadSampleFile,
  getStorageStats,
} from '../../utils/dataExport'
import { syncApi } from '../../services/syncApi'
import { syncQueue, lastSync } from '../../services/syncQueue'
import BackupRestorePanel from './BackupRestorePanel'
import ImportPanel from './ImportPanel'

// ═══════════════════════════════════════════════
// ✅ Type definitions
// ═══════════════════════════════════════════════
type StorageStats = ReturnType<typeof getStorageStats>

interface StatusState {
  loading?: boolean
  message?: string
  success?: boolean
}

interface Tab {
  id: string
  label: string
  Icon: IconType
}

interface HelpItem {
  Icon: IconType
  labelKey: string
  descKey: string
  color: string
  bg: string
}

const SettingsPage: React.FC = () => {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [activeTab, setActiveTab] = useState<string>('general')
  const [importStatus, setImportStatus] = useState<StatusState>({})
  const [exportStatus, setExportStatus] = useState<StatusState>({})
  const [clearConfirm, setClearConfirm] = useState(false)
  const [stats, setStats] = useState<StorageStats>(() => getStorageStats())

  const tabs: Tab[] = [
    { id: 'general', label: t('settings.tabs.general'), Icon: FiSettings },
    { id: 'sync', label: t('settings.tabs.sync'), Icon: FiRefreshCw },
    { id: 'language', label: t('settings.tabs.language'), Icon: FiGlobe },
    { id: 'notifications', label: t('settings.tabs.notifications'), Icon: FiBell },
    { id: 'theme', label: t('settings.tabs.theme'), Icon: FiSun },
    { id: 'pomodoro', label: t('settings.tabs.pomodoro'), Icon: FiCoffee },
    { id: 'data', label: t('settings.tabs.data'), Icon: FiDatabase },
  ]

  // ✅ بروزرسانی دوره‌ای آمار
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(getStorageStats())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'data') setStats(getStorageStats())
  }, [activeTab])

  // ═══════════════════════════════════════════════
  // ✅ Export
  // ═══════════════════════════════════════════════
  const handleExport = useCallback(() => {
    setExportStatus({ loading: true, message: '' })
    const result = exportData()
    setExportStatus({
      loading: false,
      message: result.message,
      success: result.success,
    })
    if (result.success) {
      toast.success(result.message, { position: 'bottom-left', autoClose: 3000 })
    }
    setTimeout(() => setExportStatus({}), 4000)
  }, [])

  const handleDownloadSample = useCallback(() => {
    const result = downloadSampleFile()
    if (result.success) {
      toast.success(result.message, { position: 'bottom-left', autoClose: 3000 })
    }
  }, [])

  // ═══════════════════════════════════════════════
  // ✅ Import
  // ═══════════════════════════════════════════════
  const handleImport = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      setImportStatus({ loading: true, message: '' })
      try {
        const result = await importData(file)
        setImportStatus({
          loading: false,
          message: result.message,
          success: result.success,
        })
        toast.success(result.message, { position: 'bottom-left', autoClose: 4000 })
        if (result.success) setTimeout(() => window.location.reload(), 2000)
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Import failed'
        setImportStatus({ loading: false, message: msg, success: false })
        toast.error(msg, { position: 'bottom-left', autoClose: 5000 })
      }
      event.target.value = ''
    },
    []
  )

  // ═══════════════════════════════════════════════
  // ✅ Clear all data
  // ═══════════════════════════════════════════════
  const confirmClearData = useCallback(async () => {
    setClearConfirm(false)
    const toastId = toast.loading('در حال حذف داده‌ها از سرور...', {
      position: 'bottom-left',
    })

    try {
      try {
        await syncApi.reset()
      } catch (e) {
        console.warn('Server reset failed:', e)
      }
      try {
        syncQueue.clear()
        lastSync.clear()
      } catch (e) {
        console.warn('Queue clear error:', e)
      }
      clearAllData()
      toast.update(toastId, {
        render: 'همه داده‌ها حذف شدند — در حال بازگشت به صفحه لاگین...',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
        position: 'bottom-left',
      })
      setTimeout(() => window.location.reload(), 1500)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      console.error('Clear data error:', error)
      toast.update(toastId, {
        render: 'خطا در حذف داده‌ها: ' + msg,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
        position: 'bottom-left',
      })
    }
  }, [])

  // ═══════════════════════════════════════════════
  // ✅ لیست راهنما
  // ═══════════════════════════════════════════════
  const helpItems: HelpItem[] = [
    { Icon: FiFolder, labelKey: 'nav.projects', descKey: 'projects.subtitle', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { Icon: FiCalendar, labelKey: 'nav.planning', descKey: 'planning.subtitle', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
    { Icon: FiBarChart2, labelKey: 'nav.analytics', descKey: 'analytics.subtitle', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
    { Icon: FiAward, labelKey: 'nav.achievements', descKey: 'achievements.subtitle', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
    { Icon: FiCoffee, labelKey: 'pomodoro.title', descKey: 'pomodoro.settings.tipDesc', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
    { Icon: FiTag, labelKey: 'tasks.form.tags', descKey: 'tasks.form.subtaskHint', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/30' },
  ]

  // ═══════════════════════════════════════════════
  // ✅ Render
  // ═══════════════════════════════════════════════
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-blue-600" size={26} />
          <span>{t('settings.title')}</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Tabs */}
      <Card className="p-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-thin pb-1">
          {tabs.map((tab) => {
            const Icon = tab.Icon
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
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* ═══ Sync ═══ */}
      {activeTab === 'sync' && <SyncSettings />}

      {/* ═══ General ═══ */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiSettings size={20} className="text-blue-600" />
              <span>{t('settings.general.title')}</span>
            </h3>
            <div className="space-y-4">
              {[
                { Icon: FiSave, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', title: t('settings.general.autoSave'), desc: t('settings.general.autoSaveDesc') },
                { Icon: FiSmartphone, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30', title: t('settings.general.pwa'), desc: t('settings.general.pwaDesc') },
                { Icon: FiWifi, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30', title: t('settings.general.offline'), desc: t('settings.general.offlineDesc') },
              ].map((item, i) => {
                const Icon = item.Icon
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center`}>
                        <Icon size={20} className={item.color} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{item.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</div>
                      </div>
                    </div>
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                      <FiCheck size={16} />
                      <span>{t('settings.general.enabled')}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiInfo size={20} className="text-blue-600" />
              <span>{t('settings.about.title')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Row label={t('settings.about.version')} value="2.1.0 (TypeScript)" />
                <Row label={t('settings.about.developer')} value={t('settings.about.developerName')} />
                <Row label={t('settings.about.tech')} value="React 18 + Redux + Vite" />
              </div>
              <div className="space-y-3">
                <Row label={t('settings.about.storage')} value="IndexedDB (Offline-First)" valueClass="text-emerald-600 dark:text-emerald-400" />
                <Row label={t('settings.about.support')} value="PWA + Multi-Device Sync" />
                <Row label={t('settings.about.theme')} value="Light / Dark / System" />
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
                const Icon = item.Icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className={`w-10 h-10 ${item.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={item.color} />
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

      {/* ═══ بقیه تب‌ها ═══ */}
      {activeTab === 'language' && <LanguageSettings />}
      {activeTab === 'notifications' && <NotificationSettings />}
      {activeTab === 'theme' && <ThemeSettings />}
      {activeTab === 'pomodoro' && <PomodoroSettings />}

      {/* ═══ Data ═══ */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
              <FiDatabase size={20} className="text-blue-600" />
              <span>{t('settings.data.statsTitle')}</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <StatBox label={t('settings.data.projects')} value={stats.projectsCount} Icon={FiFolder} color="blue" />
              <StatBox label={t('settings.data.tasks')} value={stats.tasksCount} Icon={FiCheckCircle} color="green" />
              <StatBox label={t('settings.data.completed')} value={stats.completedTasks} Icon={FiCheck} color="purple" />
              <StatBox label="KB" value={stats.totalSize} Icon={FiDatabase} color="orange" />
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
              <ManageRow
                icon={FiUpload}
                iconColor="text-blue-600"
                title={t('settings.data.manage.export')}
                desc={t('settings.data.manage.exportDesc')}
                button={
                  <Button onClick={handleExport} loading={exportStatus.loading} variant="primary">
                    <FiUpload size={16} />
                    <span>{t('actions.export')}</span>
                  </Button>
                }
              />

              <ManageRow
                icon={FiDownload}
                iconColor="text-green-600"
                title={t('settings.data.manage.import')}
                desc={t('settings.data.manage.importDesc')}
                button={
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImport}
                      accept=".json,application/json"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      loading={importStatus.loading}
                      variant="primary"
                    >
                      <FiDownload size={16} />
                      <span>{t('actions.import')}</span>
                    </Button>
                  </>
                }
              />

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
                <pre
                  className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto"
                  dir="ltr"
                >
{`{
  "version": "2.0",
  "projects": [...],
  "tasks": [...]
}`}
                </pre>
              </div>
              <GuideRow Icon={FiCheckCircle} color="text-green-600" title={t('settings.data.guide.method1')} desc={t('settings.data.guide.method1Desc')} />
              <GuideRow Icon={FiCheckCircle} color="text-green-600" title={t('settings.data.guide.method2')} desc={t('settings.data.guide.method2Desc')} />
              <GuideRow Icon={FiInfo} color="text-yellow-600" title={t('settings.data.guide.warning')} desc={t('settings.data.guide.warningDesc')} />
            </div>
          </Card>
<BackupRestorePanel />
<ImportPanel />
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

// ═══════════════════════════════════════════════
// ✅ Sub-components
// ═══════════════════════════════════════════════
const Row: React.FC<{ label: string; value: string; valueClass?: string }> = ({
  label,
  value,
  valueClass = '',
}) => (
  <div className="flex justify-between">
    <span className="text-gray-600 dark:text-gray-400 text-sm">{label}:</span>
    <span className={`font-medium text-gray-900 dark:text-white text-sm ${valueClass}`}>
      {value}
    </span>
  </div>
)

const StatBox: React.FC<{
  label: string
  value: number
  Icon: IconType
  color: 'blue' | 'green' | 'purple' | 'orange'
}> = ({ label, value, Icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
  }
  return (
    <div className={`p-4 rounded-lg ${colorMap[color]}`}>
      <div className="w-10 h-10 mx-auto bg-white/40 dark:bg-white/10 rounded-lg flex items-center justify-center mb-2">
        <Icon size={20} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-1">{label}</div>
    </div>
  )
}

const ManageRow: React.FC<{
  icon: IconType
  iconColor: string
  title: string
  desc: string
  button: React.ReactNode
}> = ({ icon: Icon, iconColor, title, desc, button }) => (
  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex-wrap gap-3">
    <div className="flex-1 min-w-[200px]">
      <h4 className="font-medium text-gray-900 dark:text-white text-sm flex items-center gap-2">
        <Icon size={16} className={iconColor} />
        <span>{title}</span>
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{desc}</p>
    </div>
    <div>{button}</div>
  </div>
)

const GuideRow: React.FC<{
  Icon: IconType
  color: string
  title: string
  desc: string
}> = ({ Icon, color, title, desc }) => (
  <div className="flex items-start gap-2">
    <Icon size={14} className={`${color} mt-0.5 flex-shrink-0`} />
    <span>
      <strong>{title}</strong> {desc}
    </span>
  </div>
)

export default SettingsPage