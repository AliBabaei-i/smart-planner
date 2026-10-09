import React, { useEffect } from 'react'
import { FiAlertTriangle, FiTrash2, FiInfo, FiRefreshCw } from 'react-icons/fi'
import Button from './Button'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'تأیید عملیات',
  message = 'آیا مطمئن هستید؟',
  confirmText = 'بله، انجام بده',
  cancelText = 'انصراف',
  variant = 'danger',
  Icon = null // ✅ حالا کامپوننت React Icon
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      DefaultIcon: FiTrash2,
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      confirmVariant: 'danger'
    },
    warning: {
      DefaultIcon: FiAlertTriangle,
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      confirmVariant: 'primary'
    },
    info: {
      DefaultIcon: FiInfo,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      confirmVariant: 'primary'
    }
  }

  const style = variantStyles[variant] || variantStyles.danger
  const IconComponent = Icon || style.DefaultIcon

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full transform transition-all animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${style.iconBg}`}>
              <IconComponent size={24} className={style.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant={style.confirmVariant}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              className="flex-1"
            >
              {confirmText}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog