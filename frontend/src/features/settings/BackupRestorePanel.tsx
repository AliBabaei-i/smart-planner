import React, { useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiDownload, FiUpload, FiRefreshCw, FiCheckCircle, FiAlertTriangle,
  FiInfo, FiTrash2, FiClock, FiDatabase,
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import {
  downloadBackup, importBackup, getHistory, clearHistory,
  type ImportResult,
} from '../../utils/backup'

const BackupRestorePanel: React.FC = () => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const fileRef = useRef<HTMLInputElement>(null)

  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [confirmImport, setConfirmImport] = useState<File | null>(null)
  const [history, setHistory] = useState(() => getHistory())
  const [confirmClearHistory, setConfirmClearHistory] = useState(false)

  // ✅ Export
  const handleExport = useCallback(() => {
    setExporting(true)
    try {
      const result = downloadBackup()
      if (result.success) {
        toast.success(result.message, { position: 'bottom-left', autoClose: 4000 })
        setHistory(getHistory())
      } else {
        toast.error(result.message)
      }
    } finally {
      setExporting(false)
    }
  }, [])

  // ✅ انتخاب فایل → تأیید
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setConfirmImport(file)
    e.target.value = ''
  }, [])

  // ✅ Import واقعی
  const handleConfirmImport = useCallback(async () => {
    if (!confirmImport) return
    setImporting(true)
    try {
      const result: ImportResult = await importBackup(confirmImport)
      if (result.success) {
        toast.success(result.message, { position: 'bottom-left', autoClose: 3500 })
        setConfirmImport(null)
        setTimeout(() => window.location.reload(), 2000)
      } else {
        toast.error(result.message, { position: 'bottom-left', autoClose: 5000 })
      }
    } finally {
      setImporting(false)
    }
  }, [confirmImport])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(isPersian ? 'fa-IR' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  return (
    <div className="space-y-5">
      {/* ═══ Export ═══ */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <FiDownload size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {isPersian ? 'پشتیبان‌گیری کامل' : 'Full Backup'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {isPersian
                ? 'همه‌ی داده‌های برنامه (کارها، پروژه‌ها، مالی، تنظیمات و...) در یک فایل JSON'
                : 'All app data in a single JSON file'}
            </p>
          </div>
        </div>

        <Button onClick={handleExport} loading={exporting} className="w-full !bg-blue-600 hover:!bg-blue-700">
          <FiDownload size={16} />
          <span>{isPersian ? 'دانلود فایل پشتیبان' : 'Download Backup'}</span>
        </Button>
      </Card>

      {/* ═══ Import ═══ */}
      <Card className="p-5">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
            <FiUpload size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
              {isPersian ? 'بازیابی از فایل' : 'Restore from File'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
              {isPersian
                ? 'داده‌های فعلی جایگزین می‌شوند. قبلش پشتیبان بگیر.'
                : 'Current data will be replaced. Backup first.'}
            </p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
          <div className="flex items-start gap-2">
            <FiAlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              {isPersian
                ? 'این عملیات داده‌های فعلی را کاملاً جایگزین می‌کند.'
                : 'This completely replaces current data.'}
            </p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
        />

        <Button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="w-full !bg-emerald-600 hover:!bg-emerald-700"
        >
          <FiUpload size={16} />
          <span>{isPersian ? 'انتخاب فایل پشتیبان' : 'Choose Backup File'}</span>
        </Button>
      </Card>

      {/* ═══ History ═══ */}
      {history.length > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FiClock size={16} className="text-gray-500" />
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {isPersian ? 'پشتیبان‌های اخیر' : 'Recent Backups'}
              </h4>
              <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-600 dark:text-gray-400">
                {history.length}
              </span>
            </div>
            <button
              onClick={() => setConfirmClearHistory(true)}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              {isPersian ? 'پاک کردن تاریخچه' : 'Clear History'}
            </button>
          </div>

          <div className="space-y-1.5">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/30 rounded-lg text-xs">
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[10px] text-gray-600 dark:text-gray-400 truncate">
                    {h.filename}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {formatDate(h.exportedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ms-2">
                  {Object.entries(h.counts).slice(0, 3).map(([k, v]) => (
                    <span key={k} className="text-[10px] text-gray-500 dark:text-gray-400">
                      {k}: {v}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ═══ Modals ═══ */}
      <ConfirmDialog
        isOpen={!!confirmImport}
        onClose={() => setConfirmImport(null)}
        onConfirm={handleConfirmImport}
        title={isPersian ? 'بازیابی پشتیبان' : 'Restore Backup'}
        message={
          <div className="space-y-3 text-start">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <FiAlertTriangle size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  {isPersian ? 'این کار قابل بازگشت نیست' : 'Irreversible'}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {isPersian
                    ? 'داده‌های فعلی کاملاً جایگزین می‌شوند و صفحه بارگذاری می‌شود.'
                    : 'Current data will be replaced and the page reloads.'}
                </p>
              </div>
            </div>
            {confirmImport && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700/30 rounded text-xs font-mono text-gray-600 dark:text-gray-400 truncate">
                {confirmImport.name}
              </div>
            )}
          </div>
        }
        confirmText={isPersian ? 'بازیابی کن' : 'Restore'}
        cancelText={isPersian ? 'انصراف' : 'Cancel'}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={confirmClearHistory}
        onClose={() => setConfirmClearHistory(false)}
        onConfirm={() => {
          clearHistory()
          setHistory([])
          setConfirmClearHistory(false)
        }}
        title={isPersian ? 'پاک کردن تاریخچه' : 'Clear History'}
        message={isPersian ? 'تاریخچه‌ی پشتیبان‌ها پاک شود؟ (فایل‌های دانلودشده تحت تأثیر نیستند)' : 'Clear backup history? (downloaded files are not affected)'}
        confirmText={isPersian ? 'پاک کن' : 'Clear'}
        cancelText={isPersian ? 'انصراف' : 'Cancel'}
        variant="danger"
      />
    </div>
  )
}

export default BackupRestorePanel