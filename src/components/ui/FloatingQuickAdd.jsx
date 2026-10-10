import React from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus } from 'react-icons/fi'

const FloatingQuickAdd = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <button
      onClick={onClick}
      className="
        fixed z-40 
        bottom-4 right-4
        md:bottom-4 md:right-4
        w-14 h-14 md:w-16 md:h-16
        bg-gradient-to-br from-blue-500 to-blue-700
        hover:from-blue-600 hover:to-blue-800
        text-white rounded-full shadow-2xl
        hover:shadow-3xl hover:scale-110
        transition-all duration-200
        flex items-center justify-center
        group
      "
      title={t('actions.quickAdd') || 'افزودن سریع (N)'}
      aria-label={t('actions.quickAdd') || 'Quick Add'}
    >
      <FiPlus size={28} className="group-hover:rotate-90 transition-transform duration-200" />
    </button>
  )
}

export default FloatingQuickAdd