import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { FiDownload, FiX } from 'react-icons/fi'
import Button from '../ui/Button'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

const InstallPrompt = () => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const { canInstall, promptInstall, dismiss } = useInstallPrompt()

  return (
    <AnimatePresence>
      {canInstall && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 inset-x-4 md:inset-x-auto md:end-6 md:max-w-sm z-40"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <FiDownload size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
                {isPersian ? 'برنامه رو نصب کن' : 'Install App'}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                {isPersian
                  ? 'برای دسترسی سریع‌تر و کارکرد آفلاین، این برنامه رو روی دستگاهت نصب کن.'
                  : 'Install this app for quick access and offline capability.'}
              </p>
              <div className="flex gap-2">
                <Button
                  size="small"
                  onClick={promptInstall}
                  className="!bg-emerald-600 hover:!bg-emerald-700 flex-1"
                >
                  <FiDownload size={14} />
                  <span>{isPersian ? 'نصب' : 'Install'}</span>
                </Button>
                <Button size="small" variant="secondary" onClick={dismiss}>
                  {isPersian ? 'بعداً' : 'Later'}
                </Button>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <FiX size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InstallPrompt