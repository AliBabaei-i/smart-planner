import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import { FiHome, FiCheckSquare, FiPlus, FiTarget, FiBarChart2 } from 'react-icons/fi'
import type { RootState } from '../../app/store'

interface MenuItemLink {
  type: 'link'
  path: string
  label: string
  Icon: IconType
  badge?: number
}

interface MenuItemCenter {
  type: 'center'
  onClick?: () => void
}

type MenuItem = MenuItemLink | MenuItemCenter

interface MobileBottomNavProps {
  onOpenQuickAdd: () => void
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenQuickAdd }) => {
  const { t } = useTranslation()
  const location = useLocation()
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)

  const lastViewedAt = localStorage.getItem('smart-planner-tasks-viewed-at')
  const newTasksCount = tasks.filter((task) => {
    if (task.completed) return false
    if (!lastViewedAt) return true
    return new Date(task.createdAt) > new Date(lastViewedAt)
  }).length

  const showBadge = location.pathname !== '/tasks'

  const menuItems: MenuItem[] = [
    { type: 'link', path: '/', label: t('nav.dashboard'), Icon: FiHome },
    {
      type: 'link',
      path: '/tasks',
      label: t('nav.tasks'),
      Icon: FiCheckSquare,
      badge: showBadge ? newTasksCount : 0,
    },
    { type: 'center', onClick: onOpenQuickAdd },
    { type: 'link', path: '/goals', label: t('nav.goals'), Icon: FiTarget },
    { type: 'link', path: '/analytics', label: t('nav.analytics'), Icon: FiBarChart2 },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => {
          if (item.type === 'center') {
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

          // ✅ item is MenuItemLink (نارو شده)
          const { path, label, Icon, badge } = item
          const active = isActive(path)

          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Icon size={20} className="mb-0.5" />
              <span className="text-xs font-medium">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="absolute top-1 end-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {badge > 9 ? '9+' : badge}
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