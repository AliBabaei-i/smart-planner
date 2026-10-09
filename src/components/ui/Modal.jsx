import React, { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  // ✅ بستن با کلید Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      // جلوگیری از اسکرول پس‌زمینه
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // اندازه‌های مختلف Modal
  const sizes = {
    small: 'max-w-sm',
    default: 'max-w-md',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  }

  const sizeClass = sizes[size] || sizes.default

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl ${sizeClass} w-full max-h-[90vh] overflow-y-auto transform transition-all animate-slide-up`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="بستن (Esc)"
          >
            ✕
          </button>
        </div>

        {/* محتوا */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal