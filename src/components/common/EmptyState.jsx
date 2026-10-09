import React from 'react'
import { FiInbox } from 'react-icons/fi'
import Button from '../ui/Button'

const EmptyState = ({ 
  Icon = FiInbox,
  title = 'چیزی برای نمایش نیست',
  description = '',
  actionLabel,
  onAction,
  compact = false
}) => {
  const IconComponent = Icon

  return (
    <div className={`text-center ${compact ? 'py-8' : 'py-12'}`}>
      <div className={`${compact ? 'w-16 h-16' : 'w-20 h-20'} mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4`}>
        <IconComponent 
          size={compact ? 28 : 40} 
          className="text-gray-400" 
        />
      </div>
      <h3 className={`font-semibold text-gray-900 dark:text-white mb-2 ${
        compact ? 'text-base' : 'text-xl'
      }`}>
        {title}
      </h3>
      {description && (
        <p className={`text-gray-600 dark:text-gray-400 mb-4 ${
          compact ? 'text-xs' : 'text-sm'
        }`}>
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState