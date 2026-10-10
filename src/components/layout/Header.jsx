import React from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiMenu, FiSearch, FiFolder, FiCheckSquare, FiTrendingUp, FiPlus } from 'react-icons/fi'
import Notifications from '../../features/notifications/Notifications'
import ThemeToggle from '../../features/theme/ThemeToggle'
import LanguageSwitcher from '../common/LanguageSwitcher'

const Header = ({ onOpenSearch, onOpenQuickAdd, onToggleSidebar }) => {
  const { t } = useTranslation()
  const { projects = [] } = useSelector(state => state.projects)
  const { tasks = [] } = useSelector(state => state.tasks)
  
  const completedTasks = tasks.filter(task => task.completed).length
  const productivity = tasks.length > 0 
    ? Math.round((completedTasks / tasks.length) * 100) 
    : 0

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-full mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16 gap-2 md:gap-4">
          {/* شروع */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <button
              onClick={onToggleSidebar}
              className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <FiMenu size={22} />
            </button>

            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white font-bold text-sm">SP</span>
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900 dark:text-white hidden sm:block">
              {t('app.name')}
            </h1>
          </div>

          {/* دکمه جستجو */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-500 dark:text-gray-400 flex-1 max-w-md"
            title={`${t('actions.search')} (Ctrl+K)`}
          >
            <FiSearch size={18} className="flex-shrink-0" />
            <span className="text-sm flex-1 text-start truncate">
              {t('search.placeholder')}
            </span>
            <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 font-mono flex-shrink-0">
              /
            </kbd>
          </button>

          {/* پایان */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="hidden lg:flex items-center gap-4 me-1">
              <div className="flex items-center gap-2 text-sm">
                <FiFolder className="text-blue-500 flex-shrink-0" size={16} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums text-center min-w-[24px]">
                  {projects.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiCheckSquare className="text-green-500 flex-shrink-0" size={16} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums text-center min-w-[24px]">
                  {tasks.length}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FiTrendingUp className="text-orange-500 flex-shrink-0" size={16} />
                <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums text-center min-w-[44px]">
                  {productivity}%
                </span>
              </div>
            </div>

            {/* ✅ دکمه Quick Add */}
            <button
              onClick={onOpenQuickAdd}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
              title={`${t('actions.quickAdd') || 'افزودن سریع'} (N)`}
            >
              <FiPlus size={16} />
              <span className="hidden md:inline">{t('actions.quickAdd') || 'افزودن'}</span>
            </button>

            <button
              onClick={onOpenSearch}
              className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiSearch size={20} />
            </button>

            <LanguageSwitcher />
            <ThemeToggle />
            <Notifications />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header