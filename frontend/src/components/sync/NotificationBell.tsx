import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiBell, FiCheck, FiCheckCircle, FiX, FiAlertTriangle,
  FiInfo, FiAward, FiClock, FiRefreshCw, FiAlertCircle, FiDollarSign,
} from 'react-icons/fi'
import type { AppNotification, NotificationType } from '../../features/notifications/notificationsSlice'
import {
  markAsRead, markAllAsRead, dismissNotification,
  selectAllNotifications, selectUnreadCount,
} from '../../features/notifications/notificationsSlice'
import type { RootState, AppDispatch } from '../../app/store'

// ✅ همه‌ی ۱۳ نوع — شامل success
const TYPE_CONFIG: Record<
  NotificationType,
  { Icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }
> = {
  task_due:       { Icon: FiClock,         color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  task_overdue:   { Icon: FiAlertCircle,   color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/30' },
  achievement:    { Icon: FiAward,         color: 'text-yellow-600',  bg: 'bg-yellow-50 dark:bg-yellow-900/30' },
  sync_error:     { Icon: FiAlertTriangle, color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/30' },
  sync_success:   { Icon: FiRefreshCw,     color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/30' },
  pomodoro_done:  { Icon: FiCheckCircle,   color: 'text-purple-600',  bg: 'bg-purple-50 dark:bg-purple-900/30' },
  habit_streak:   { Icon: FiAward,         color: 'text-orange-600',  bg: 'bg-orange-50 dark:bg-orange-900/30' },
  finance_budget: { Icon: FiDollarSign,    color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  system:         { Icon: FiInfo,          color: 'text-gray-600',    bg: 'bg-gray-50 dark:bg-gray-700' },
  info:           { Icon: FiInfo,          color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  warning:        { Icon: FiAlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/30' },
  success:        { Icon: FiCheckCircle,   color: 'text-green-600',   bg: 'bg-green-50 dark:bg-green-900/30' },   // ✅ اضافه شد
  error:          { Icon: FiAlertCircle,   color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-900/30' },
}

const NotificationBell: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const notifications = useSelector(selectAllNotifications)
  const unreadCount = useSelector(selectUnreadCount)
  const recent = notifications.slice(0, 5)

  useEffect(() => {
    if (!isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen])

  const handleClick = useCallback(
    (notif: AppNotification) => {
      dispatch(markAsRead(notif.id))
      if (notif.actionPath) {
        navigate(notif.actionPath)
        setIsOpen(false)
      }
    },
    [dispatch, navigate]
  )

  const formatRelative = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (mins < 1) return isPersian ? 'همین الان' : 'Just now'
    if (mins < 60) return isPersian ? `${mins} دقیقه پیش` : `${mins}m ago`
    if (hours < 24) return isPersian ? `${hours} ساعت پیش` : `${hours}h ago`
    return isPersian ? `${days} روز پیش` : `${days}d ago`
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        aria-label={t('nav.notifications') || 'Notifications'}
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -end-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full end-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                <FiBell size={14} className="text-blue-600 dark:text-blue-400" />
                <span>{t('notifications.title') || 'اعلان‌ها'}</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <FiCheck size={11} />
                  <span>{t('notifications.markAllRead') || 'همه خوانده'}</span>
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {recent.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <div className="w-12 h-12 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-2">
                    <FiBell size={20} className="text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('notifications.empty') || 'اعلانی وجود ندارد'}
                  </p>
                </div>
              ) : (
                recent.map((notif) => {
                  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
                  const Icon = cfg.Icon
                  return (
                    <div
                      key={notif.id}
                      className={`group relative flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0 cursor-pointer transition-colors ${
                        notif.read
                          ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          : 'bg-blue-50/40 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={14} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-1">
                          <span className={`text-xs flex-1 ${
                            notif.read
                              ? 'text-gray-600 dark:text-gray-400'
                              : 'text-gray-900 dark:text-white font-medium'
                          }`}>
                            {notif.title}
                          </span>
                          {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1" />}
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {formatRelative(notif.createdAt)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          dispatch(dismissNotification(notif.id))
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded flex-shrink-0"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )
                })
              )}
            </div>

            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700"
            >
              {t('notifications.viewAll') || 'مشاهده همه'}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell