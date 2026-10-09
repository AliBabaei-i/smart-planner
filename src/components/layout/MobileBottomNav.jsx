import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiHome, FiCheckSquare, FiCalendar, FiBarChart2, FiEdit3 } from 'react-icons/fi'

const MobileBottomNav = () => {
  const { t } = useTranslation()
  const location = useLocation()
  const { tasks = [] } = useSelector(state => state.tasks)
  
  const today = new Date().toDateString()
  const pendingTodayCount = tasks.filter(t => 
    !t.completed && 
    t.dueDate && 
    new Date(t.dueDate).toDateString() === today
  ).length

  const menuItems = [
    { path: '/', label: t('nav.dashboard'), Icon: FiHome },
    { path: '/tasks', label: t('nav.tasks'), Icon: FiCheckSquare, badge: pendingTodayCount },
    { path: '/notes', label: t('nav.notes'), Icon: FiEdit3, isCenter: true },
    { path: '/planning', label: t('nav.planning'), Icon: FiCalendar },
    { path: '/analytics', label: t('nav.analytics'), Icon: FiBarChart2 },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {menuItems.map(item => {
          const IconComponent = item.Icon
          const active = isActive(item.path)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                active
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {item.isCenter ? (
                <div className={`-mt-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  active
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white scale-105'
                    : 'bg-gradient-to-br from-primary-400 to-primary-600 text-white'
                }`}>
                  <IconComponent size={24} />
                </div>
              ) : (
                <>
                  <IconComponent size={20} className="mb-0.5" />
                  <span className="text-xs font-medium">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-1 end-1/4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileBottomNav