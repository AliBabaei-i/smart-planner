import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { FiWifi, FiWifiOff } from 'react-icons/fi'

// ═══════════════════════════════════════════════
// ✅ تنظیمات
// ═══════════════════════════════════════════════
const AUTO_HIDE_DELAY = 3000       // ۳ ثانیه بعد از نمایش خودکار محو بشه
const OFFLINE_DEBOUNCE = 1500      // ۱.۵ ثانیه صبر قبل از نمایش آفلاین
const ONLINE_DEBOUNCE = 2000       // ۲ ثانیه صبر قبل از نمایش آنلاین (شده)
const MIN_DISPLAY_TIME = 2000      // حداقل ۲ ثانیه نمایش داده بشه

const OfflineIndicator = () => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  // ✅ وضعیت مرورگر
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  
  // ✅ وضعیت نمایش
  const [showIndicator, setShowIndicator] = useState(false)
  const [displayedStatus, setDisplayedStatus] = useState(null) // 'online' | 'offline'
  
  // ✅ Refs برای مدیریت تایمرها
  const offlineTimerRef = useRef(null)
  const onlineTimerRef = useRef(null)
  const hideTimerRef = useRef(null)
  const displayStartRef = useRef(null)
  const mountedRef = useRef(true)
  const initialLoadRef = useRef(true)

  // ✅ پاک کردن همه تایمرها
  const clearAllTimers = useCallback(() => {
    if (offlineTimerRef.current) clearTimeout(offlineTimerRef.current)
    if (onlineTimerRef.current) clearTimeout(onlineTimerRef.current)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    offlineTimerRef.current = null
    onlineTimerRef.current = null
    hideTimerRef.current = null
  }, [])

  // ✅ مخفی کردن بعد از تاخیر
  const scheduleHide = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    
    hideTimerRef.current = setTimeout(() => {
      if (!mountedRef.current) return
      setShowIndicator(false)
      // ✅ بعد از محو شدن، status رو هم پاک کن
      setTimeout(() => {
        if (mountedRef.current) setDisplayedStatus(null)
      }, 300)
    }, AUTO_HIDE_DELAY)
  }, [])

  // ✅ نمایش indicator
  const showStatus = useCallback((status) => {
    if (!mountedRef.current) return
    
    // ✅ اگه در حال نمایش همون status هستیم، فقط تایمر hide رو ریست کن
    if (displayedStatus === status && showIndicator) {
      scheduleHide()
      return
    }
    
    // ✅ اگه indicator باز است ولی status فرق داره، اجازه بده حداقل زمان نمایش تمام بشه
    if (showIndicator && displayStartRef.current) {
      const elapsed = Date.now() - displayStartRef.current
      const remaining = MIN_DISPLAY_TIME - elapsed
      
      if (remaining > 0) {
        setTimeout(() => showStatus(status), remaining)
        return
      }
    }
    
    setDisplayedStatus(status)
    setShowIndicator(true)
    displayStartRef.current = Date.now()
    scheduleHide()
  }, [displayedStatus, showIndicator, scheduleHide])

  // ✅ Listen به تغییرات آنلاین/آفلاین
  useEffect(() => {
    mountedRef.current = true

    const handleOnline = () => {
      if (!mountedRef.current) return
      
      setIsOnline(true)
      
      // ✅ پاک کردن تایمر offline قبلی
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current)
        offlineTimerRef.current = null
      }
      
      // ✅ صبر کن قبل از نمایش (چون اتصال‌ها ناپایدارن)
      onlineTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        // ✅ فقط اگه قبلاً آفلاین بودیم نشون بده
        if (displayedStatus === 'offline') {
          showStatus('online')
        }
      }, ONLINE_DEBOUNCE)
    }

    const handleOffline = () => {
      if (!mountedRef.current) return
      
      setIsOnline(false)
      
      // ✅ پاک کردن تایمر online قبلی
      if (onlineTimerRef.current) {
        clearTimeout(onlineTimerRef.current)
        onlineTimerRef.current = null
      }
      
      // ✅ صبر کن قبل از نمایش آفلاین (شاید فقط یه لحظه قطع شده)
      offlineTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return
        showStatus('offline')
      }, OFFLINE_DEBOUNCE)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // ✅ فقط اگه در ابتدا آفلاین بودیم، نشون بده
    if (!navigator.onLine && initialLoadRef.current) {
      initialLoadRef.current = false
      offlineTimerRef.current = setTimeout(() => {
        if (mountedRef.current) showStatus('offline')
      }, OFFLINE_DEBOUNCE)
    } else {
      initialLoadRef.current = false
    }

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearAllTimers()
    }
  }, [showStatus, displayedStatus, clearAllTimers])

  // ✅ اگه نمایش داده نمی‌شه، چیزی رندر نکن
  if (!showIndicator || !displayedStatus) return null

  const isOfflineStatus = displayedStatus === 'offline'

  return (
    <div
      className={`
        fixed top-4 left-1/2 -translate-x-1/2 z-[60]
        transition-all duration-300 ease-out
        ${showIndicator ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      <div
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg
          backdrop-blur-md border
          ${isOfflineStatus
            ? 'bg-amber-50/95 dark:bg-amber-900/90 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200'
            : 'bg-green-50/95 dark:bg-green-900/90 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200'
          }
        `}
      >
        {isOfflineStatus ? (
          <FiWifiOff size={16} className="flex-shrink-0" />
        ) : (
          <FiWifi size={16} className="flex-shrink-0" />
        )}
        <span className="text-sm font-medium whitespace-nowrap">
          {isOfflineStatus
            ? (isPersian ? 'حالت آفلاین' : 'Offline')
            : (isPersian ? 'اتصال برقرار شد' : 'Back online')
          }
        </span>
      </div>
    </div>
  )
}

export default OfflineIndicator