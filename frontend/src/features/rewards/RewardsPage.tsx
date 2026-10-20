import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiPlus, FiGift, FiLock, FiUnlock, FiTrash2, FiStar } from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import RewardForm from './RewardForm'
import { deleteReward, unlockReward } from './rewardsSlice'
import type { RootState } from '../../app/store'
import type { Reward } from '../../types/rewards'

const RewardsPage = () => {
  const { t, i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch()

  // ✅ FIX: حذف || {} و استفاده مستقیم از RootState
  const { rewards = [] } = useSelector((state: RootState) => state.rewards)
  const { tasks = [] } = useSelector((state: RootState) => state.tasks)
  const { projects = [] } = useSelector((state: RootState) => state.projects)
  const { totalPomodoros = 0, currentStreak = 0 } = useSelector((state: RootState) => state.achievements)

  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    const completedTasks = tasks.filter(t => t.completed)
    
    rewards.forEach(reward => {
      if (reward.isUnlocked || reward.conditionType === 'manual') return

      let isMet = false

      switch (reward.conditionType) {
        case 'tasks_completed':
          isMet = completedTasks.length >= reward.targetValue
          break
        case 'project_tasks_completed':
          const projectTasks = completedTasks.filter(t => t.projectId === reward.projectId)
          isMet = projectTasks.length >= reward.targetValue
          break
        case 'streak_days':
          isMet = currentStreak >= reward.targetValue
          break
        case 'pomodoro_count':
          isMet = totalPomodoros >= reward.targetValue
          break
      }

      if (isMet) {
        dispatch(unlockReward(reward.id))
        toast.success(
          <div className="flex items-center gap-2" dir={isPersian ? 'rtl' : 'ltr'}>
            <span className="text-2xl">{reward.icon}</span>
            <div>
              <div className="font-bold">{isPersian ? 'پاداش آزاد شد!' : 'Reward Unlocked!'}</div>
              <div className="text-sm">{reward.title}</div>
            </div>
          </div>,
          { autoClose: 6000, position: "bottom-left" }
        )
      }
    })
  }, [tasks, rewards, currentStreak, totalPomodoros, dispatch, isPersian])

  const handleManualUnlock = (reward: Reward) => {
    dispatch(unlockReward(reward.id))
    toast.success(isPersian ? `${reward.title} آزاد شد!` : `${reward.title} unlocked!`)
  }

  const lockedRewards = rewards.filter(r => !r.isUnlocked)
  const unlockedRewards = rewards.filter(r => r.isUnlocked)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiGift className="text-purple-600" size={26} />
            <span>{isPersian ? 'سیستم پاداش' : 'Reward System'}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isPersian ? 'برای تلاش‌هات به خودت جایزه بده' : 'Treat yourself for your hard work'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <FiPlus size={16} />
          <span>{isPersian ? 'پاداش جدید' : 'New Reward'}</span>
        </Button>
      </div>

      {unlockedRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
            <FiUnlock size={18} />
            {isPersian ? 'آزاد شده (نوبت جایزه‌ست!)' : 'Unlocked (Time to reward yourself!)'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedRewards.map(reward => (
              <Card key={reward.id} className="p-5 border-2 border-green-500 bg-green-50 dark:bg-green-900/10 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-6xl opacity-10 rotate-12">
                  {reward.icon}
                </div>
                <div className="flex items-start gap-3 relative z-10">
                  <div className="text-4xl">{reward.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">{reward.title}</h3>
                    {reward.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{reward.description}</p>}
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                      <FiStar size={12} />
                      {isPersian ? 'آزاد شده' : 'Unlocked'}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setDeleteId(reward.id)}
                  className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                >
                  <FiTrash2 size={14} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          <FiLock size={18} />
          {isPersian ? 'در انتظار تلاش' : 'Locked'}
        </h3>
        {lockedRewards.length === 0 && unlockedRewards.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <FiGift size={40} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isPersian ? 'هنوز پاداشی تعریف نکردی!' : 'No rewards defined yet!'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isPersian ? 'یک پاداش برای خودت تعریف کن تا انگیزه‌ات بیشتر بشه.' : 'Set a reward for yourself to stay motivated.'}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <FiPlus size={16} />
              <span>{isPersian ? 'تعریف اولین پاداش' : 'Create First Reward'}</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedRewards.map(reward => {
              const completedTasks = tasks.filter(t => t.completed)
              let currentProgress = 0
              if (reward.conditionType === 'tasks_completed') currentProgress = completedTasks.length
              if (reward.conditionType === 'project_tasks_completed') currentProgress = completedTasks.filter(t => t.projectId === reward.projectId).length
              if (reward.conditionType === 'streak_days') currentProgress = currentStreak
              if (reward.conditionType === 'pomodoro_count') currentProgress = totalPomodoros

              const progressPercent = reward.targetValue > 0 ? Math.min((currentProgress / reward.targetValue) * 100, 100) : 0

              return (
                <Card key={reward.id} className="p-5 relative overflow-hidden group opacity-80 hover:opacity-100 transition-opacity">
                  <div className="absolute -right-4 -top-4 text-6xl opacity-5 rotate-12 grayscale">
                    {reward.icon}
                  </div>
                  <div className="flex items-start gap-3 relative z-10">
                    <div className="text-4xl grayscale opacity-50">{reward.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">{reward.title}</h3>
                      {reward.description && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{reward.description}</p>}
                      
                      {reward.conditionType !== 'manual' ? (
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
                            <span>{isPersian ? 'پیشرفت' : 'Progress'}</span>
                            <span>{currentProgress} / {reward.targetValue}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleManualUnlock(reward)}
                          className="mt-3 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full font-medium hover:bg-purple-200 transition-colors"
                        >
                          {isPersian ? 'دریافت پاداش' : 'Claim Reward'}
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setDeleteId(reward.id)}
                    className="absolute top-2 left-2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={isPersian ? 'تعریف پاداش جدید' : 'New Reward'} size="default">
        <RewardForm onClose={() => setShowForm(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) dispatch(deleteReward(deleteId))
          setDeleteId(null)
        }}
        title={isPersian ? 'حذف پاداش' : 'Delete Reward'}
        message={isPersian ? 'آیا مطمئنی می‌خوای این پاداش رو حذف کنی؟' : 'Are you sure you want to delete this reward?'}
        confirmText={isPersian ? 'حذف' : 'Delete'}
        cancelText={isPersian ? 'انصراف' : 'Cancel'}
        variant="danger"
      />
    </div>
  )
}

export default RewardsPage