import React, { memo, type ReactNode } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import Modal from './Modal'
import Button from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title?: ReactNode
  message?: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}

const ConfirmDialog = memo(({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأیید',
  message = 'آیا مطمئن هستید؟',
  confirmText = 'تأیید',
  cancelText = 'انصراف',
  variant = 'danger',
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="small" title={title}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              variant === 'danger'
                ? 'bg-red-100 dark:bg-red-900/30'
                : 'bg-primary-100 dark:bg-primary-900/30'
            }`}
          >
            <FiAlertTriangle
              size={20}
              className={
                variant === 'danger'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-primary-600 dark:text-primary-400'
              }
            />
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 pt-1">
            {message}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            className="flex-1"
          >
            {confirmText}
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  )
})

ConfirmDialog.displayName = 'ConfirmDialog'

export default ConfirmDialog