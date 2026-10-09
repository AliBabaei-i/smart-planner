import React from 'react'
import { useTranslation } from 'react-i18next'
import { 
  FiCommand, 
  FiSearch, 
  FiX, 
  FiArrowUp, 
  FiArrowDown, 
  FiCornerDownLeft,
  FiInfo,
  FiMonitor
} from 'react-icons/fi'
import Card from '../../components/ui/Card'

const KeyboardShortcutsHelp = () => {
  const { t } = useTranslation()

  const shortcuts = [
    { 
      keys: ['/'], 
      description: t('settings.shortcuts.search'),
      Icon: FiSearch
    },
    { 
      keys: ['Ctrl', 'K'], 
      description: t('settings.shortcuts.searchAlt'),
      Icon: FiCommand
    },
    { 
      keys: ['Esc'], 
      description: t('settings.shortcuts.close'),
      Icon: FiX
    },
    { 
      keys: ['↑', '↓'], 
      description: t('settings.shortcuts.navigate'),
      Icon: FiArrowUp
    },
    { 
      keys: ['Enter'], 
      description: t('settings.shortcuts.select'),
      Icon: FiCornerDownLeft
    }
  ]

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
        <FiMonitor size={20} className="text-blue-600" />
        <span>{t('settings.shortcuts.title')}</span>
      </h3>

      <div className="space-y-3">
        {shortcuts.map((shortcut, index) => {
          const IconComponent = shortcut.Icon
          return (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <IconComponent size={16} className="text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
              </div>
              
              <div className="flex items-center space-x-1 space-x-reverse flex-shrink-0">
                {shortcut.keys.map((key, kIndex) => (
                  <React.Fragment key={kIndex}>
                    <kbd className="px-2 py-1 text-xs font-mono bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded border border-gray-300 dark:border-gray-600 shadow-sm min-w-[28px] text-center">
                      {key}
                    </kbd>
                    {kIndex < shortcut.keys.length - 1 && (
                      <span className="text-gray-400 text-xs">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2 space-x-reverse">
          <FiInfo size={14} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            {t('settings.shortcuts.hint')}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default KeyboardShortcutsHelp