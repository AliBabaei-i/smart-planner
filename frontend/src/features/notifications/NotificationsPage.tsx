import React, { useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FiBell, FiCheck, FiTrash2, FiX, FiCheckCircle, FiAlertTriangle,
  FiInfo, FiAward, FiClock, FiRefreshCw, FiAlertCircle, FiDollarSign,
  FiFilter, FiInbox,
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

// ✅ همه‌ی ۱۳ نوع — شامل success
const TYPE_CONFIG: Record<
  NotificationType,
  {
    Icon: React.ComponentType<{ size?: number; className?: string }>
    color: string
    bg: string
    label: { fa: string; en: string }
  }
> = {
  task_due:       { Icon: FiClock,         color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30',      label: { fa: 'کار نزدیک',   en: 'Due' } },
  task_overdue:   { Icon: FiAlertCircle,   color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-900/30',        label: { fa: 'عقب‌افتاده',  en: 'Overdue' } },
  achievement:    { Icon: FiAward,         color: 'text-yellow-600',  bg: 'bg-yellow-100 dark:bg-yellow-900/30',  label: { fa: 'دستاورد',     en: 'Achievement' } },
  sync_error:     { Icon: FiAlertTriangle, color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-900/30',        label: { fa: 'خطای سینک',   en: 'Sync Error' } },
  sync_success:   { Icon: FiRefreshCw,     color: 'text-green-600',   bg: 'bg-green-100 dark:bg-green-900/30',    label: { fa: 'سینک',        en: 'Synced' } },
  pomodoro_done:  { Icon: FiCheckCircle,   color: 'text-purple-600',  bg: 'bg-purple-100 dark:bg-purple-900/30',  label: { fa: 'پومودورو',    en: 'Pomodoro' } },
  habit_streak:   { Icon: FiAward,         color: 'text-orange-600',  bg: 'bg-orange-100 dark:bg-orange-900/30',  label: { fa: 'زنجیره',      en: 'Streak' } },
  finance_budget: { Icon: FiDollarSign,    color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', label: { fa: 'بودجه',       en: 'Budget' } },
  system:         { Icon: FiInfo,          color: 'text-gray-600',    bg: 'bg-gray-100 dark:bg-gray-700',         label: { fa: 'سیستم',       en: 'System' } },
  info:           { Icon: FiInfo,          color: 'text-blue-600',    bg: 'bg-blue-100 dark:bg-blue-900/30',      label: { fa: 'اطلاع',       en: 'Info' } },
  warning:        { Icon: FiAlertTriangle, color: 'text-amber-600',   bg: 'bg-amber-100 dark:bg-amber-900/30',    label: { fa: 'هشدار',       en: 'Warning' } },
  success:        { Icon: FiCheckCircle,   color: 'text-green-600',   bg: 'bg-green-100 dark:bg-green-900/30',    label: { fa: 'موفق',        en: 'Success' } },
  error:          { Icon: FiAlertCircle,   color: 'text-red-600',     bg: 'bg-red-100 dark:bg-red-900/30',        label: { fa: 'خطا',         en: 'Error' } },
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

  const hasReadItems = notifications.some((n) => n.read)

  // ✅ گروه‌بندی بر اساس تاریخ
  const grouped = useMemo(() => {
    if (filter !== 'all') {
      return { [isPersian ? 'نتایج' : 'Results']: filtered }
    }
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

    const groups: Record<string, AppNotification[]> = {
      [isPersian ? 'امروز' : 'Today']: [],
      [isPersian ? 'دیروز' : 'Yesterday']: [],
      [isPersian ? 'این هفته' : 'This Week']: [],
      [isPersian ? 'قدیمی‌تر' : 'Older']: [],
    }
    for (const n of filtered) {
      const d = new Date(n.createdAt)
      if (d >= today) groups[isPersian ? 'امروز' : 'Today'].push(n)
      else if (d >= yesterday) groups[isPersian ? 'دیروز' : 'Yesterday'].push(n)
      else if (d >= weekAgo) groups[isPersian ? 'این هفته' : 'This Week'].push(n)
      else groups[isPersian ? 'قدیمی‌تر' : 'Older'].push(n)
    }
    return Object.fromEntries(
      Object.entries(groups).filter(([, items]) => items.length > 0)
    )
  }, [filtered, filter, isPersian])

  const handleClick = (notif: AppNotification) => {
    dispatch(markAsRead(notif.id))
    if (notif.actionPath) navigate(notif.actionPath)
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    if (mins < 1) return isPersian ? 'همین الان' : 'Just now'
    if (mins < 60) return isPersian ? `${mins} دقیقه پیش` : `${mins}m`
    if (hours < 24)
      return d.toLocaleTimeString(isPersian ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString(isPersian ? 'fa-IR' : 'en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* ═══════ Header — همان الگوی TasksPage / FinancePage ═══════ */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBell className="text-blue-600" size={26} />
            <span>{t('notifications.title') || 'اعلان‌ها'}</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
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
          {hasReadItems && (
            <Button variant="secondary" size="small" onClick={() => dispatch(clearReadNotifications())}>
              <FiTrash2 size={14} />
              <span>{t('notifications.clearRead') || 'پاک خوانده‌ها'}</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="danger" size="small" onClick={() => dispatch(clearAll())}>
              <FiTrash2 size={14} />
              <span>{t('notifications.clearAll') || 'پاک همه'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* ═══════ Filters ═══════ */}
      <Card className="p-3">
        <div className="flex items-center gap-2 flex-wrap">
          <FiFilter size={14} className="text-gray-400 ms-1" />
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
              {f === 'unread' && `${t('notifications.filter.unread') || 'خوانده‌نشده'}${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
              {f === 'read' && (t('notifications.filter.read') || 'خوانده‌شده')}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} {isPersian ? 'مورد' : 'items'}
          </span>
        </div>
      </Card>

      {/* ═══════ List or Empty ═══════ */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
            <FiInbox size={40} className="text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {filter === 'all'
              ? (t('notifications.empty') || 'اعلانی وجود ندارد')
              : filter === 'unread'
              ? (isPersian ? 'اعلان خوانده‌نشده‌ای نیست' : 'No unread notifications')
              : (isPersian ? 'اعلان خوانده‌شده‌ای نیست' : 'No read notifications')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md mx-auto">
            {filter === 'all'
              ? (t('notifications.emptyDesc') || 'وقتی رویدادی رخ دهد، اینجا نمایش داده می‌شود.')
              : (isPersian ? 'فیلتر را تغییر دهید.' : 'Try changing the filter.')}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([groupName, items]) => (
            <div key={groupName}>
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-1">
                {groupName}
              </h3>
              <div className="space-y-1.5">
                {items.map((notif) => {
                  const cfg = TYPE_CONFIG[notif.type] ?? TYPE_CONFIG.info
                  const Icon = cfg.Icon
                  return (
                    <Card
                      key={notif.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md group ${
                        !notif.read
                          ? 'ring-1 ring-blue-200 dark:ring-blue-900/50 bg-blue-50/40 dark:bg-blue-900/10'
                          : ''
                      }`}
                      onClick={() => handleClick(notif)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                          <Icon size={18} className={cfg.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-sm ${
                              notif.read
                                ? 'text-gray-700 dark:text-gray-300'
                                : 'text-gray-900 dark:text-white font-semibold'
                            }`}>
                              {notif.title}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                              {cfg.label[isPersian ? 'fa' : 'en']}
                            </span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1.5 block">
                            {formatTime(notif.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {!notif.read && (
                            <button
                              onClick={(e) => { e.stopPropagation(); dispatch(markAsRead(notif.id)) }}
                              className="p-1.5 text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                              title={isPersian ? 'خوانده شد' : 'Mark read'}
                            >
                              <FiCheck size={14} />
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); dispatch(removeNotification(notif.id)) }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                            title={isPersian ? 'حذف' : 'Delete'}
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default NotificationsPage