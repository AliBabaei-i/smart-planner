import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiX,
  FiEdit2,
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiFlag,
  FiCalendar,
  FiTarget,
  FiPause,
  FiPlay,
  FiCheck
} from 'react-icons/fi'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import {
  addMilestone,
  toggleMilestone,
  deleteMilestone,
  updateMilestone,
  setGoalStatus,
  toggleArchiveGoal
} from './goalsSlice'
import { formatDateByLang, formatNumber } from '../../utils/formatters'

const GoalDetailsModal = ({ isOpen, onClose, goal, onEdit }) => {
  const { t, i18n } = useTranslation()
  const dispatch = useDispatch()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [newMilestone, setNewMilestone] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  useEffect(() => {
    setNewMilestone('')
    setEditingId(null)
    setEditingTitle('')
  }, [goal?.id])

  if (!goal) return null

  const milestones = goal.milestones || []
  const completed = milestones.filter(m => m.completed).length
  const progress = milestones.length > 0
    ? Math.round((completed / milestones.length) * 100)
    : 0

  const handleAddMilestone = () => {
    if (!newMilestone.trim()) return
    dispatch(addMilestone({ goalId: goal.id, title: newMilestone.trim() }))
    setNewMilestone('')
  }

  const handleToggle = (id) => {
    dispatch(toggleMilestone({ goalId: goal.id, milestoneId: id }))
  }

  const handleDelete = (id) => {
    dispatch(deleteMilestone({ goalId: goal.id, milestoneId: id }))
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setEditingTitle(m.title)
  }

  const saveEdit = () => {
    if (editingTitle.trim() && editingId) {
      dispatch(updateMilestone({
        goalId: goal.id,
        milestoneId: editingId,
        title: editingTitle.trim()
      }))
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleStatusChange = (status) => {
    dispatch(setGoalStatus({ id: goal.id, status }))
    const messages = {
      completed: isPersian ? 'هدف تکمیل شد! 🎉' : 'Goal completed!',
      paused: isPersian ? 'هدف متوقف شد' : 'Goal paused',
      active: isPersian ? 'هدف فعال شد' : 'Goal activated',
      cancelled: isPersian ? 'هدف لغو شد' : 'Goal cancelled'
    }
    toast.success(messages[status], { position: 'bottom-left', autoClose: 2500 })
  }

  const getDaysRemaining = () => {
    if (!goal.targetDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(goal.targetDate)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = getDaysRemaining()

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('goals.details.title')} size="large">
      <div className="space-y-5">
        {/* هدر */}
        <div>
          <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${goal.color}20` }}
              >
                <FiTarget size={24} style={{ color: goal.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                  {goal.title}
                </h2>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t(`goals.categories.${goal.category}`)}
                </div>
              </div>
            </div>
          </div>

          {goal.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              {goal.description}
            </p>
          )}
        </div>

        {/* اطلاعات */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
              <FiCalendar size={12} />
              {t('goals.form.startDate')}
            </div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDateByLang(goal.startDate)}
            </div>
          </div>

          {goal.targetDate && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <FiCalendar size={12} />
                {t('goals.form.targetDate')}
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {formatDateByLang(goal.targetDate)}
              </div>
            </div>
          )}

          {daysRemaining !== null && (
            <div className={`p-3 rounded-lg ${
              daysRemaining < 0
                ? 'bg-red-50 dark:bg-red-900/20'
                : daysRemaining < 7
                ? 'bg-orange-50 dark:bg-orange-900/20'
                : 'bg-green-50 dark:bg-green-900/20'
            }`}>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                {isPersian ? 'روز باقی‌مانده' : 'Days Remaining'}
              </div>
              <div className={`text-lg font-bold ${
                daysRemaining < 0
                  ? 'text-red-600 dark:text-red-400'
                  : daysRemaining < 7
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {daysRemaining >= 0
                  ? formatNumber(daysRemaining)
                  : `${formatNumber(Math.abs(daysRemaining))} ${t('goals.overdue')}`}
              </div>
            </div>
          )}
        </div>

        {/* پیشرفت */}
        <div>
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              {t('goals.details.progress')}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatNumber(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="h-3 rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: goal.color
              }}
            />
          </div>
        </div>

        {/* نقاط عطف */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 text-sm">
              <FiFlag size={16} />
              <span>{t('goals.milestones')}</span>
              {milestones.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                  {formatNumber(completed)}/{formatNumber(milestones.length)}
                </span>
              )}
            </h4>
          </div>

          {milestones.length > 0 ? (
            <div className="space-y-1.5 mb-3">
              {milestones.map(m => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                >
                  <button
                    onClick={() => handleToggle(m.id)}
                    className="flex-shrink-0"
                  >
                    {m.completed ? (
                      <FiCheckCircle size={18} className="text-green-500" />
                    ) : (
                      <FiCircle size={18} className="text-gray-400 hover:text-blue-500" />
                    )}
                  </button>

                  {editingId === m.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); saveEdit() }
                        if (e.key === 'Escape') { setEditingId(null); setEditingTitle('') }
                      }}
                      onBlur={saveEdit}
                      autoFocus
                      className="flex-1 bg-white dark:bg-gray-600 px-2 py-1 rounded border border-blue-500 text-sm text-gray-900 dark:text-white outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(m)}
                      className={`flex-1 text-sm cursor-pointer ${
                        m.completed
                          ? 'line-through text-gray-400 dark:text-gray-500'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {m.title}
                    </span>
                  )}

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(m)}
                      className="text-gray-400 hover:text-blue-500 p-1"
                      title={t('actions.edit')}
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title={t('actions.delete')}
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm mb-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
              <FiFlag size={28} className="mx-auto mb-2 opacity-40" />
              <p>{isPersian ? 'هنوز نقطه عطفی اضافه نشده' : 'No milestones yet'}</p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddMilestone() }
              }}
              placeholder={t('goals.form.addMilestone')}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Button
              onClick={handleAddMilestone}
              disabled={!newMilestone.trim()}
              size="small"
            >
              <FiPlus size={14} />
            </Button>
          </div>
        </div>

        {/* دکمه‌های وضعیت */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {isPersian ? 'تغییر وضعیت:' : 'Change status:'}
          </div>
          <div className="flex gap-2 flex-wrap">
            {goal.status !== 'active' && (
              <Button size="small" variant="secondary" onClick={() => handleStatusChange('active')}>
                <FiPlay size={12} />
                <span>{t('goals.status.active')}</span>
              </Button>
            )}
            {goal.status === 'active' && (
              <Button size="small" variant="primary" onClick={() => handleStatusChange('completed')}>
                <FiCheck size={12} />
                <span>{t('goals.status.completed')}</span>
              </Button>
            )}
            {goal.status === 'active' && (
              <Button size="small" variant="secondary" onClick={() => handleStatusChange('paused')}>
                <FiPause size={12} />
                <span>{t('goals.status.paused')}</span>
              </Button>
            )}
          </div>
        </div>

        {/* دکمه‌های پایین */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={() => {
              onClose()
              onEdit?.(goal)
            }}
            className="flex-1"
          >
            <FiEdit2 size={16} />
            <span>{t('actions.edit')}</span>
          </Button>
          <Button variant="secondary" onClick={onClose} className="flex-1">
            <FiX size={16} />
            <span>{t('actions.close')}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default GoalDetailsModal