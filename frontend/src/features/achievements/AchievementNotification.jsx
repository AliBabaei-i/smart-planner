import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiAward, FiStar, FiX } from 'react-icons/fi'
import { removeOneNewlyUnlocked, ACHIEVEMENTS } from './achievementsSlice'

const AchievementNotification = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { newlyUnlocked = [] } = useSelector(state => state.achievements)
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [currentId, setCurrentId] = useState(null)
  const timerRef = useRef(null)

  // ✅ نمایش اعلان (بدون cancel شدن تایمر توسط re-render)
  useEffect(() => {
    if (newlyUnlocked.length > 0 && !currentAchievement) {
      const achievementId = newlyUnlocked[0]
      const achievement = ACHIEVEMENTS[achievementId]
      
      if (achievement) {
        setCurrentAchievement(achievement)
        setCurrentId(achievementId)
        
        // ✅ پاک کردن تایمر قبلی اگه هست
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
        
        // ✅ تایمر جدید - 10 ثانیه
        timerRef.current = setTimeout(() => {
          dispatch(removeOneNewlyUnlocked(achievementId))
          setCurrentAchievement(null)
          setCurrentId(null)
          timerRef.current = null
        }, 10000)
      }
    }
  }, [newlyUnlocked, currentAchievement, dispatch])

  // ✅ پاک‌سازی تایمر هنگام unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (currentId) {
      dispatch(removeOneNewlyUnlocked(currentId))
      setCurrentAchievement(null)
      setCurrentId(null)
    }
  }

  if (!currentAchievement) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[150] animate-slide-down">
      <div className="bg-gradient-to-l from-yellow-400 via-yellow-500 to-orange-500 rounded-2xl shadow-2xl p-1 max-w-sm">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center gap-3 relative">
          <button
            onClick={handleClose}
            className="absolute top-2 end-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
            title={t('actions.close')}
          >
            <FiX size={16} />
          </button>

          <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce-slow">
            <FiAward size={32} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 pe-4">
            <div className="text-xs font-medium text-yellow-600 dark:text-yellow-400 mb-1 flex items-center gap-1">
              <FiStar size={12} />
              <span>{t('achievements.new')}</span>
            </div>
            <div className="font-bold text-gray-900 dark:text-white truncate text-sm">
              {t(currentAchievement.titleKey)}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {t(currentAchievement.descKey)}
            </div>
            <div className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-1 flex items-center gap-1">
              <FiStar size={10} />
              <span>+{currentAchievement.points} {t('achievements.points')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AchievementNotification