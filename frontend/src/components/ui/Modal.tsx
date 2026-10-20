import React, { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX } from 'react-icons/fi'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode          // ✅ string | JSX | number
  children: ReactNode
  size?: 'small' | 'default' | 'large' | 'xlarge'
  hideCloseButton?: boolean
}

const sizeClasses = {
  small: 'max-w-sm',
  default: 'max-w-lg',
  large: 'max-w-2xl',
  xlarge: 'max-w-4xl',
}

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'default',
  hideCloseButton = false,
}: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const hasTitle = title !== undefined && title !== null && title !== ''

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} overflow-hidden max-h-[90vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {(hasTitle || !hideCloseButton) && (
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                <div className="text-lg font-bold text-gray-900 dark:text-white truncate pe-4 flex-1">
                  {hasTitle ? title : null}
                </div>
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
            )}

            <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export default Modal