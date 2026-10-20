import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import type { IconType } from 'react-icons'
import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiActivity,
  FiEdit3,
  FiTarget,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiSettings,
  FiDollarSign,
  FiGift,
  FiTrendingUp,
} from 'react-icons/fi'
import LogoutButton from '../ui/LogoutButton'
import type { RootState } from '../../app/store'

interface MenuItem {
  path: string
  label: string
  Icon: IconType
  badge?: number
  sublabel?: string | null
}

interface SidebarProps {
  onItemClick?: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ onItemClick }) => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { tasks = [] } = useSelector((s: RootState) => s.tasks)
  const achievements = useSelector(
    (s: RootState) => (s as any).achievements
  ) as { totalPoints?: number } | undefined

  const isRTL = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const lastViewedAt = localStorage.getItem('smart-planner-tasks-viewed-at')
  const newTasksCount = tasks.filter((task) => {
    if (task.completed) return false
    if (!lastViewedAt) return true
    return new Date(task.createdAt) > new Date(lastViewedAt)
  }).length

  const showBadge = location.pathname !== '/tasks'

  const menuItems: MenuItem[] = [
    { path: '/', label: t('nav.dashboard'), Icon: FiHome },
    { path: '/projects', label: t('nav.projects'), Icon: FiFolder },
    {
      path: '/tasks',
      label: t('nav.tasks'),
      Icon: FiCheckSquare,
      badge: showBadge ? newTasksCount : 0,
    },
    { path: '/habits', label: t('nav.habits'), Icon: FiActivity },
    { path: '/notes', label: t('nav.notes'), Icon: FiEdit3 },
    { path: '/goals', label: t('nav.goals'), Icon: FiTarget },
    { path: '/growth', label: t('nav.growth'), Icon: FiTrendingUp },
    { path: '/planning', label: t('nav.planning'), Icon: FiCalendar },
    { path: '/analytics', label: t('nav.analytics'), Icon: FiBarChart2 },
    {
      path: '/achievements',
      label: t('nav.achievements'),
      Icon: FiAward,
      sublabel: achievements?.totalPoints
        ? `${achievements.totalPoints} ${t('achievements.points')}`
        : null,
    },
    { path: '/rewards', label: t('nav.rewards'), Icon: FiGift },
    { path: '/finance', label: t('nav.finance'), Icon: FiDollarSign },
    { path: '/settings', label: t('nav.settings'), Icon: FiSettings },
  ]

  const isActive = (path: string) => location.pathname === path
  const handleClick = () => onItemClick?.()

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 h-full flex flex-col">
      <nav className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const active = isActive(item.path)
              const IconComponent = item.Icon

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleClick}
                    className={`
                      flex items-center justify-between p-2.5 rounded-lg transition-all duration-150
                      ${
                        active
                          ? `bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 ${
                              isRTL ? 'border-r-2' : 'border-l-2'
                            } border-primary-600`
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent
                        size={20}
                        className={
                          active ? 'text-primary-600 dark:text-primary-400' : ''
                        }
                      />
                      <div className="text-start">
                        <span className="font-medium block text-sm">
                          {item.label}
                        </span>
                        {item.sublabel && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.sublabel}
                          </span>
                        )}
                      </div>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-4 px-1.5 flex items-center justify-center font-bold flex-shrink-0">
                        {item.badge > 9 ? '9+' : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>
      <LogoutButton variant="full" className="w-full mt-3" />
      <div className="flex-shrink-0 p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="text-center text-xs text-gray-400 dark:text-gray-500">
          {t('app.name')} {t('app.version')}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar