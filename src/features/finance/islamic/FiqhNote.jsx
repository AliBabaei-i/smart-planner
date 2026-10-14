import React, { memo } from 'react'
import {
  FiInfo, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi'

const FiqhNote = memo(({ title, children, variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
  }
  const Icon = variant === 'warning' ? FiAlertTriangle
              : variant === 'success' ? FiCheckCircle
              : FiInfo

  return (
    <div className={`p-3 rounded-lg border text-xs leading-relaxed ${variants[variant]}`}>
      <div className="flex items-start gap-2">
        <Icon size={14} className="flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <strong className="block mb-1">{title}</strong>}
          {children}
        </div>
      </div>
    </div>
  )
})

FiqhNote.displayName = 'FiqhNote'

export default FiqhNote