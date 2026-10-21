import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FiBell, FiCheck, FiTrash2, FiX, FiCheckCircle, FiAlertTriangle,
  FiInfo, FiAward, FiClock, FiRefreshCw, FiAlertCircle, FiDollarSign,
  FiFilter,
} from 'react-icons/fi'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import type { AppNotification, NotificationType } from './notificationsSlice'
import {
  markAsRead, markAllAsRead, removeNotification,
  clearReadNotifications, clearAll,
  selectAllNotifications, selectUnreadCount,
} from './notificationsSlice'
import type { RootState, AppDispatch } from '../../app/store'

const TYPE_CONFIG: Record<
  NotificationType,
  {
    Icon: React.ComponentType<{ size?: number; className?: string }>
    color: string
    bg: string
    label: { fa: string; en: string }
  }
> = {
  task_due: { Icon: FiClock, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: { fa: 'کار نزدیک', en: 'Task Due' } },
  task_overdue: { Icon: FiAlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: { fa: 'کار عقب', en: 'Overdue' } },
  achievement: { Icon: FiAward, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', label: { fa: 'دستاورد', en: 'Achievement' } },
  sync_error: { Icon: FiAlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: { fa: 'خطای سینک', en: 'Sync Error' } },
  sync_success: { Icon: FiRefreshCw, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: { fa: 'سینک موفق', en: 'Synced' } },
  pomodoro_done: { Icon: FiCheckCircle, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', label: { fa: 'پومودورو', en: 'Pomodoro' } },
  habit_streak: { Icon: FiAward, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', label: { fa: 'زنجیره عادت', en: 'Streak' } },
  finance_budget: { Icon: FiDollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: { fa: 'بودجه', en: 'Budget' } },
  system: { Icon: FiInfo, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-700', label: { fa: 'سیستم', en: 'System' } },
  info: { Icon: FiInfo, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: { fa: 'اطلاع', en: 'Info' } },
  warning: { Icon: FiAlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: { fa: 'هشدار', en: 'Warning' } },
  error: { Icon: FiAlertCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: { fa: 'خطا', en: 'Error' } },
}

type FilterType = 'all' | 'unread' | 'read'

const NotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const notifications = useSelector(selectAllNotifications)
  const unreadCount = useSelector(selectUnreadCount)

  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    if (filter === 'unread') return notifications.filter((n) => !n.read)
    if (filter === 'read') return notifications.filter((n) => n.read)
    return notifications
  }, [notifications, filter])

  const handleClick = (notif: AppNotification) => {
    dispatch(markAsRead(notif.id))
    if (notif.actionPath) navigate(notif.actionPath)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(isPersian ? 'fa-IR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBell className="text-blue-600" size={26} />
            <span>{t('notifications.title') || 'اعلان‌ها'}</span>
            {unreadCount > 0 && (
              <span className="text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            {t('notifications.subtitle') || 'همه اعلان‌ها و رویدادها'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button variant="secondary" size="small" onClick={() => dispatch(markAllAsRead())}>
              <FiCheck size={14} />
              <span>{t('notifications.markAllRead') || 'همه خوانده'}</span>
            </Button>
          )}
          <Button
            variant="secondary"
            size="small"
            onClick={() => dispatch(clearReadNotifications())}
            disabled={notifications.filter((n) => n.read).length === 0}
          >
            <FiTrash2 size={14} />
            <span>{t('notifications.clearRead') || 'پاک‌کردن خوانده‌ها'}</span>
          </Button>
        </div>
      </div>

      <Card className="p-2">
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter size={14} className="text-gray-400 ms-2" />
          {(['all', 'unread', 'read'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f === 'all' && (t('notifications.filter.all') || 'همه')}
              {f === 'unread' && `${t('notifications.filter.unread') || 'خوانده‌نشده'} (${unreadCount})`}
              {f === 'read' && (t('notifications.filter.read') || 'خوانده‌شده')}
            </button>
          ))}
          <div className="flex-1" />
          {notifications.length > 0 && (
            <button
              onClick={() => dispatch(clearAll())}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              {t('notifications.clearAll') || 'پاک‌کردن همه'}
            </button>
          )}
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FiBell size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('notifications.empty') || 'اعلانی وجود ندارد'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t('notifications.emptyDesc') || 'وقتی رویدادی رخ دهد، اینجا نمایش داده می‌شود.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((notif) => {
            const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
            const Icon = cfg.Icon
            return (
              <div
                key={notif.id}
                onClick={() => handleClick(notif)}
                className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                  notif.read
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    : 'bg-blue-50/60 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                  <Icon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm ${
                        notif.read
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-900 dark:text-white font-semibold'
                      }`}
                    >
                      {notif.title}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {cfg.label[isPersian ? 'fa' : 'en']}
                    </span>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1 block">{formatDate(notif.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        dispatch(markAsRead(notif.id))
                      }}
                      className="p-1.5 text-gray-400 hover:text-green-500 rounded"
                    >
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      dispatch(removeNotification(notif.id))
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-500 rounded"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage