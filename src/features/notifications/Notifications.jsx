import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { 
  FiBell, 
  FiCheck, 
  FiTrash2, 
  FiX,
  FiInfo,
  FiAlertTriangle,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi'
import { markAsRead, removeNotification, markAllAsRead, clearAllNotifications } from './notificationsSlice'
import { formatRelativeTimeByLang } from '../../utils/formatters'

const Notifications = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { notifications = [] } = useSelector(state => state.notifications)
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  const unreadCount = notifications.filter(n => !n.read).length

  // ✅ بستن با کلیک بیرون
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // ✅ بستن با Esc
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen])

  const getNotificationIcon = (type) => {
    const icons = {
      info: FiInfo,
      warning: FiAlertTriangle,
      success: FiCheckCircle,
      error: FiAlertCircle
    }
    return icons[type] || FiInfo
  }

  const getNotificationColor = (type) => {
    const colors = {
      info: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30',
      warning: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30',
      success: 'text-green-600 bg-green-50 dark:bg-green-900/30',
      error: 'text-red-600 bg-red-50 dark:bg-red-900/30'
    }
    return colors[type] || 'text-gray-600 bg-gray-50 dark:bg-gray-700'
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id))
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
        title={t('notifications.title')}
      >
        <FiBell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"> 
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="
            absolute top-full mt-2 
            end-0 
            w-80 max-w-[calc(100vw-2rem)]
            bg-white dark:bg-gray-800 
            rounded-lg shadow-xl 
            border border-gray-200 dark:border-gray-700 
            z-50 overflow-hidden 
            animate-fade-in
          "
        >
          {/* هدر */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
              <FiBell size={16} />
              <span>{t('notifications.title')}</span>
            </h3>
            <div className="flex gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  title={t('notifications.markAllRead')}
                >
                  <FiCheck size={12} />
                  <span className="hidden sm:inline">{t('notifications.markAllRead')}</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => dispatch(clearAllNotifications())}
                  className="text-xs text-red-500 hover:underline flex items-center gap-1 ms-2"
                  title={t('notifications.clearAll')}
                >
                  <FiTrash2 size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <FiBell size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{t('notifications.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map(notification => {
                  const IconComponent = getNotificationIcon(notification.type)
                  return (
                    <div
                      key={notification.id}
                      className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex gap-3">
                        <div className={`${getNotificationColor(notification.type)} p-2 rounded-lg flex-shrink-0`}>
                          <IconComponent size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400">
                              {formatRelativeTimeByLang(notification.createdAt)}
                            </span>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            dispatch(removeNotification(notification.id))
                          }}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0 p-1"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Notifications