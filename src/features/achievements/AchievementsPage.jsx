import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiAward,
  FiRefreshCw,
  FiCheckCircle,
  FiTarget,
  FiStar,
  FiZap,
  FiClock,
  FiTag,
  FiTrendingUp,
  FiFolder,
  FiSun,
  FiMoon,
  FiCoffee,
  FiLock,
  FiChevronRight,
  FiActivity,
  FiFlag
} from 'react-icons/fi'
import { ACHIEVEMENTS, resetAchievements } from './achievementsSlice'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

const AchievementsPage = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { 
    unlocked = [], 
    totalPoints = 0,
    totalTasksCompleted = 0,
    totalPomodoros = 0,
    currentStreak = 0,
    totalTimeMinutes = 0
  } = useSelector(state => state.achievements)
  
  const [filterCategory, setFilterCategory] = useState('all')
  const [resetConfirm, setResetConfirm] = useState(false)

  // ✅ آیکون‌های دسته‌بندی با React Icons
  const categoryIcons = {
    all: FiAward,
    tasks: FiCheckCircle,
    projects: FiFolder,
    pomodoro: FiCoffee,
    streak: FiZap,
    time: FiClock,
    tags: FiTag,
    productivity: FiTrendingUp,
    special: FiStar
  }

  const categories = [
    { id: 'all', name: t('achievements.categories.all') },
    { id: 'tasks', name: t('achievements.categories.tasks') },
    { id: 'projects', name: t('achievements.categories.projects') },
    { id: 'pomodoro', name: t('achievements.categories.pomodoro') },
    { id: 'streak', name: t('achievements.categories.streak') },
    { id: 'time', name: t('achievements.categories.time') },
    { id: 'tags', name: t('achievements.categories.tags') },
    { id: 'productivity', name: t('achievements.categories.productivity') },
    { id: 'special', name: t('achievements.categories.special') }
  ]

  const allAchievements = Object.values(ACHIEVEMENTS)
  const filteredAchievements = filterCategory === 'all' 
    ? allAchievements 
    : allAchievements.filter(a => a.category === filterCategory)

  const totalAchievements = allAchievements.length
  const unlockedCount = unlocked.length
  const progress = Math.round((unlockedCount / totalAchievements) * 100)

  // ✅ سطوح با آیکون‌های React Icons (نه emoji)
  const getLevel = () => {
    if (totalPoints >= 1000) return { 
      level: 5, 
      titleKey: 'achievements.levels.legendary', 
      Icon: FiAward, 
      color: 'from-purple-500 to-pink-500',
      textColor: 'text-purple-600 dark:text-purple-400'
    }
    if (totalPoints >= 500) return { 
      level: 4, 
      titleKey: 'achievements.levels.pro', 
      Icon: FiFlag, 
      color: 'from-yellow-500 to-orange-500',
      textColor: 'text-yellow-600 dark:text-yellow-400'
    }
    if (totalPoints >= 200) return { 
      level: 3, 
      titleKey: 'achievements.levels.advanced', 
      Icon: FiStar, 
      color: 'from-blue-500 to-purple-500',
      textColor: 'text-blue-600 dark:text-blue-400'
    }
    if (totalPoints >= 50) return { 
      level: 2, 
      titleKey: 'achievements.levels.intermediate', 
      Icon: FiZap, 
      color: 'from-green-500 to-blue-500',
      textColor: 'text-green-600 dark:text-green-400'
    }
    return { 
      level: 1, 
      titleKey: 'achievements.levels.beginner', 
      Icon: FiTarget, 
      color: 'from-gray-400 to-gray-600',
      textColor: 'text-gray-600 dark:text-gray-400'
    }
  }

  const level = getLevel()
  const LevelIcon = level.Icon

  const confirmReset = () => {
    dispatch(resetAchievements())
    toast.success(t('achievements.reset'), {
      position: "bottom-left",
      autoClose: 3000,
    })
    setResetConfirm(false)
  }

  // ✅ فرمت ساعت
  const formatHours = (minutes) => {
    const hours = Math.floor(minutes / 60)
    return `${hours}${t('tasks.time.hours')}`
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
            <FiAward className="text-yellow-500" size={26} />
            <span>{t('achievements.title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('achievements.subtitle')}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setResetConfirm(true)} size="small">
          <FiRefreshCw size={14} />
          <span>{t('achievements.reset')}</span>
        </Button>
      </div>

      {/* کارت سطح */}
      <Card className="p-6 overflow-hidden relative">
        <div className={`absolute inset-0 bg-gradient-to-l ${level.color} opacity-10`}></div>
        <div className="relative">
          <div className="flex items-center space-x-4 space-x-reverse flex-wrap gap-3">
            {/* آیکون سطح */}
            <div className={`w-20 h-20 bg-gradient-to-br ${level.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
              <LevelIcon size={40} className="text-white" />
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('achievements.level')} {level.level}
                </span>
                <span className={`text-xs px-2 py-0.5 bg-white dark:bg-gray-700 rounded-full font-medium ${level.textColor}`}>
                  {t(level.titleKey)}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center space-x-2 space-x-reverse">
                <FiStar size={24} className="text-yellow-500" />
                <span>{totalPoints}</span>
                <span className="text-lg text-gray-500">{t('achievements.points')}</span>
              </div>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>{unlockedCount} {t('achievements.of')} {totalAchievements} {t('achievements.achievements')}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all bg-gradient-to-l ${level.color}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-2">
            <FiCheckCircle size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {totalTasksCompleted}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('achievements.stats.completedTasks')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/40 rounded-xl flex items-center justify-center mb-2">
            <FiCoffee size={22} className="text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {totalPomodoros}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('achievements.stats.pomodoros')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/40 rounded-xl flex items-center justify-center mb-2">
            <FiZap size={22} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {currentStreak}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('achievements.stats.streak')}
          </div>
        </Card>

        <Card className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-2">
            <FiClock size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatHours(totalTimeMinutes)}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {t('achievements.stats.totalTime')}
          </div>
        </Card>
      </div>

      {/* فیلتر دسته‌بندی */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const IconComponent = categoryIcons[cat.id]
            const count = cat.id === 'all' 
              ? { unlocked: unlocked.length, total: allAchievements.length }
              : {
                  unlocked: allAchievements.filter(a => a.category === cat.id && unlocked.includes(a.id)).length,
                  total: allAchievements.filter(a => a.category === cat.id).length
                }
            
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg text-sm transition-colors ${
                  filterCategory === cat.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <IconComponent size={14} />
                <span>{cat.name}</span>
                <span className="text-xs opacity-70">
                  ({count.unlocked}/{count.total})
                </span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* لیست دستاوردها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map(achievement => {
          const isUnlocked = unlocked.includes(achievement.id)
          // ✅ آیکون دستاورد از categoryIcons
          const IconComponent = categoryIcons[achievement.category] || FiAward
          
          return (
            <Card 
              key={achievement.id} 
              className={`p-5 transition-all ${
                isUnlocked 
                  ? 'ring-2 ring-yellow-400 dark:ring-yellow-500 shadow-md' 
                  : 'opacity-60 grayscale'
              }`}
            >
              <div className="flex items-start space-x-4 space-x-reverse">
                {/* ✅ آیکون با React Icons */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {isUnlocked ? (
                    <IconComponent size={28} className="text-white" />
                  ) : (
                    <FiLock size={24} className="text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 space-x-reverse mb-1">
                    <h3 className={`font-bold truncate ${
                      isUnlocked 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {t(achievement.titleKey)}
                    </h3>
                    {isUnlocked && (
                      <FiCheckCircle size={14} className="text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t(achievement.descKey)}
                  </p>
                  <div className={`text-xs font-bold flex items-center space-x-1 space-x-reverse ${
                    isUnlocked 
                      ? 'text-orange-600 dark:text-orange-400' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    <FiStar size={12} />
                    <span>{achievement.points} {t('achievements.points')}</span>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* حالت خالی */}
      {filteredAchievements.length === 0 && (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-yellow-50 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <FiAward size={40} className="text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('tasks.noResults')}
          </h3>
          <Button variant="secondary" onClick={() => setFilterCategory('all')}>
            {t('tasks.clearFilters')}
          </Button>
        </Card>
      )}

      <ConfirmDialog
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={confirmReset}
        title={t('achievements.reset')}
        message={t('settings.data.manage.clearDesc')}
        confirmText={t('actions.confirm')}
        cancelText={t('actions.cancel')}
        variant="danger"
        icon="🔄"
      />
    </div>
  )
}

export default AchievementsPage