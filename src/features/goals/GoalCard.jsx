import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiTarget,
  FiEdit2,
  FiTrash2,
  FiCalendar,
  FiFlag,
  FiCheckCircle,
  FiArchive
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { formatDateByLang, formatNumber } from '../../utils/formatters'

const GoalCard = ({ goal, onClick, onEdit, onDelete, onArchive }) => {
  const { t } = useTranslation()

  const totalMilestones = goal.milestones?.length || 0
  const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0
  const progress = totalMilestones > 0
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0

  const getDaysRemaining = () => {
    if (!goal.targetDate) return null
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const target = new Date(goal.targetDate)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - now) / (1000 * 60 * 60 * 24))
  }

  const daysRemaining = getDaysRemaining()

  const getDaysColor = () => {
    if (daysRemaining === null) return 'text-gray-500 dark:text-gray-400'
    if (daysRemaining < 0) return 'text-red-600 dark:text-red-400'
    if (daysRemaining < 7) return 'text-orange-600 dark:text-orange-400'
    if (daysRemaining < 30) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getStatusBadge = () => {
    const map = {
      active: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
      completed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
      paused: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
      cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' }
    }
    const s = map[goal.status] || map.active
    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
        {t(`goals.status.${goal.status}`)}
      </span>
    )
  }

  return (
    <Card
      className="p-4 hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      <div
        className="w-full h-1 rounded-full mb-3"
        style={{ backgroundColor: goal.color }}
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${goal.color}20` }}
          >
            <FiTarget size={20} style={{ color: goal.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate text-gray-900 dark:text-white text-sm">
              {goal.title}
            </h3>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {t(`goals.categories.${goal.category}`)}
            </div>
          </div>
        </div>

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onArchive?.() }}
            className="text-gray-400 hover:text-yellow-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={goal.archived ? t('goals.unarchive') : t('goals.archive')}
          >
            <FiArchive size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.() }}
            className="text-gray-400 hover:text-blue-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('actions.edit')}
          >
            <FiEdit2 size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.() }}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('actions.delete')}
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {goal.description}
        </p>
      )}

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FiFlag size={10} />
            {formatNumber(completedMilestones)}/{formatNumber(totalMilestones)} {t('goals.milestones')}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {formatNumber(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{
              width: `${progress}%`,
              backgroundColor: goal.color
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {goal.targetDate ? (
          <span className={`text-xs flex items-center gap-1 ${getDaysColor()}`}>
            <FiCalendar size={10} />
            <span>{formatDateByLang(goal.targetDate)}</span>
            {daysRemaining !== null && (
              <span className="font-medium">
                ({daysRemaining >= 0
                  ? `${formatNumber(daysRemaining)}${t('goals.daysShort')}`
                  : `${formatNumber(Math.abs(daysRemaining))}${t('goals.daysShort')} ${t('goals.overdue')}`
                })
              </span>
            )}
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            {t('goals.noTargetDate')}
          </span>
        )}

        {getStatusBadge()}
      </div>
    </Card>
  )
}

export default GoalCard