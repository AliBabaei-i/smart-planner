import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMic, FiMicOff, FiAlertCircle } from 'react-icons/fi'
import { useTranslation } from 'react-i18next'
import { useVoiceInput } from '../../hooks/useVoiceInput'

interface VoiceInputButtonProps {
  onResult: (text: string) => void
  size?: 'small' | 'default' | 'large'
  className?: string
}

const VoiceInputButton = ({ onResult, size = 'default', className = '' }: VoiceInputButtonProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const { isListening, isSupported, error, startListening, stopListening } = useVoiceInput({
    lang: isPersian ? 'fa-IR' : 'en-US',
    onResult: (text) => {
      onResult(text)
    }
  })

  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-12 h-12'
  }

  const iconSizes = {
    small: 14,
    default: 18,
    large: 22
  }

  if (!isSupported) return null

  return (
    <div className={`relative ${className}`}>
      <motion.button
        type="button"
        onClick={isListening ? stopListening : startListening}
        whileTap={{ scale: 0.95 }}
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center
          transition-colors shadow-sm
          ${isListening
            ? 'bg-red-500 text-white animate-pulse'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }
        `}
        title={isPersian ? 'ورودی صوتی' : 'Voice input'}
      >
        {isListening ? <FiMicOff size={iconSizes[size]} /> : <FiMic size={iconSizes[size]} />}
      </motion.button>

      {/* ✅ نشانگر در حال شنیدن */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-full mt-2 start-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1.5 rounded-full whitespace-nowrap shadow-lg"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              {isPersian ? 'در حال شنیدن...' : 'Listening...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ خطا */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute top-full mt-2 start-0 bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap flex items-center gap-1"
          >
            <FiAlertCircle size={12} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceInputButton