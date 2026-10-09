import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiSun, FiMoon } from 'react-icons/fi'
import { toggleTheme } from './themeSlice'

const ThemeToggle = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { mode } = useSelector(state => state.theme)

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="flex items-center space-x-1.5 space-x-reverse text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
      title={mode === 'light' ? t('theme.dark') : t('theme.light')}
    >
      {mode === 'light' ? (
        <>
          <FiMoon size={18} />
          <span className="text-sm font-medium hidden sm:inline">
            {t('theme.dark')}
          </span>
        </>
      ) : (
        <>
          <FiSun size={18} />
          <span className="text-sm font-medium hidden sm:inline">
            {t('theme.light')}
          </span>
        </>
      )}
    </button>
  )
}

export default ThemeToggle