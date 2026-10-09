import { useState, useCallback } from 'react'

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'بله',
    cancelText: 'انصراف',
    variant: 'danger',
    icon: '🗑️'
  })

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'تأیید عملیات',
        message: options.message || 'آیا مطمئن هستید؟',
        confirmText: options.confirmText || 'بله',
        cancelText: options.cancelText || 'انصراف',
        variant: options.variant || 'danger',
        icon: options.icon || '🗑️',
        onConfirm: () => {
          resolve(true)
          setConfirmState(prev => ({ ...prev, isOpen: false }))
        }
      })
    })
  }, [])

  const closeConfirm = useCallback(() => {
    setConfirmState(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    confirmState,
    confirm,
    closeConfirm
  }
}

export default useConfirm