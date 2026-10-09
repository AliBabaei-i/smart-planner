import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        toast.success('🟢 اتصال اینترنت برقرار شد', {
          position: "bottom-left",
          autoClose: 3000,
        })
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
      toast.warn('🔴 شما آفلاین هستید', {
        position: "bottom-left",
        autoClose: false, // تا زمانی که آنلاین نشده بماند
        closeOnClick: false,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}