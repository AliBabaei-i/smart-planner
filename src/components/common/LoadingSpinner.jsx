import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiLoader } from 'react-icons/fi'

const LoadingSpinner = ({ size = 'medium', text = null, fullScreen = false }) => {
  const { t } = useTranslation()
  
  const sizes = {
    small: 20,
    medium: 32,
    large: 48,
    xlarge: 64
  }

  const displayText = text !== null ? text : t('actions.loading')

  const content = (
    <div className="flex flex-col items-center justify-center p-4">
      <FiLoader 
        size={sizes[size]} 
        className="text-blue-600 dark:text-blue-400 animate-spin" 
      />
      {displayText && (
        <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">{displayText}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-[200] flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}

export default LoadingSpinner