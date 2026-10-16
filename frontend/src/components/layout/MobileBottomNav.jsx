import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiHome, FiCheckSquare, FiPlus, FiTarget, FiBarChart2 } from 'react-icons/fi'

const MobileBottomNav = ({ onOpenQuickAdd }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { tasks = [] } = useSelector(state => state.tasks)

  const lastViewedAt = localStorage.getItem('smart-planner-tasks-viewed-at')
  const newTasksCount = tasks.filter(t => {
    if (t.completed) return false
    if (!lastViewedAt) return true
    return new Date(t.createdAt) > new Date(lastViewedAt)
  }).length

  const showBadge = location.pathname !== '/tasks'

  const menuItems = [
    { path: '/', label: t('nav.dashboard'), Icon: FiHome },
    {
      path: '/tasks',
      label: t('nav.tasks'),
      Icon: FiCheckSquare,
      badge: showBadge ? newTasksCount : 0
    },
    { isCenter: true, onClick: onOpenQuickAdd },
    { path: '/goals', label: t('nav.goals'), Icon: FiTarget },
    { path: '/analytics', label: t('nav.analytics'), Icon: FiBarChart2 },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item, index) => {
          if (item.isCenter) {
            return (
              <button
                key="quick-add"
                onClick={item.onClick}
                className="-mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all bg-gradient-to-br from-blue-500 to-blue-700 text-white hover:scale-105 active:scale-95"
                title={t('actions.quickAdd')}
              >
                <FiPlus size={26} />
              </button>
            )
          }

          const IconComponent = item.Icon
          const active = isActive(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <IconComponent size={20} className="mb-0.5" />
              <span className="text-xs font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute top-1 end-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav