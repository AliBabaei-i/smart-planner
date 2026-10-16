import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiTrendingUp,
  FiClock,
  FiX,
  FiCheckCircle
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { addSkillSession, deleteSkillSession, SKILL_LEVELS } from './growthSlice'
import { formatNumber } from '../../utils/formatters'

const SkillCard = ({ skill, onEdit, onDelete }) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [showSessions, setShowSessions] = useState(false)
  const [showAddSession, setShowAddSession] = useState(false)
  const [sessionMinutes, setSessionMinutes] = useState('')
  const [sessionNotes, setSessionNotes] = useState('')

  const levelProgress = ((skill.level - 1) / 4) * 100
  const targetProgress = skill.targetLevel > 1
    ? ((skill.level - 1) / (skill.targetLevel - 1)) * 100
    : 0

  const handleAddSession = () => {
    if (!sessionMinutes || parseInt(sessionMinutes) <= 0) return
    dispatch(addSkillSession({
      skillId: skill.id,
      minutes: sessionMinutes,
      notes: sessionNotes
    }))
    toast.success(t('growth.toast.sessionAdded'), { position: 'bottom-left', autoClose: 2000 })
    setSessionMinutes('')
    setSessionNotes('')
    setShowAddSession(false)
  }

  const sessions = skill.sessions || []
  const totalHours = skill.hours || 0

  return (
    <Card className="p-4 hover:shadow-lg transition-all">
      {/* رنگ بالا */}
      <div
        className="w-full h-1 rounded-full mb-3"
        style={{ backgroundColor: skill.color }}
      />

      {/* هدر */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
            {skill.name}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {t(`growth.categories.${skill.category}`)}
          </div>
        </div>
        <div className="flex gap-0.5">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-blue-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.edit')}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.delete')}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {skill.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {skill.description}
        </p>
      )}

      {/* سطح فعلی */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FiCheckCircle size={10} />
            {t('growth.currentLevel')}
          </span>
          <span className="font-medium" style={{ color: skill.color }}>
            {t(`growth.levels.${SKILL_LEVELS[skill.level - 1]?.key}`)}
          </span>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(lvl => (
            <div
              key={lvl}
              className="flex-1 h-2 rounded-full transition-all"
              style={{
                backgroundColor: lvl <= skill.level ? skill.color : '#e5e7eb'
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <FiTrendingUp size={10} />
            {t('growth.targetLevel')}
          </span>
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {t(`growth.levels.${SKILL_LEVELS[skill.targetLevel - 1]?.key}`)}
          </span>
        </div>
      </div>

      {/* آمار */}
      <div className="grid grid-cols-2 gap-2 mb-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1 mb-0.5">
            <FiClock size={10} />
            {t('growth.totalHours')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {formatNumber(Math.round(totalHours * 10) / 10)} {t('growth.hoursShort')}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
            {t('growth.sessions')}
          </div>
          <div className="font-semibold text-gray-900 dark:text-white text-sm">
            {formatNumber(sessions.length)}
          </div>
        </div>
      </div>

      {/* دکمه‌ها */}
      <div className="flex gap-2">
        <Button
          size="small"
          onClick={() => setShowAddSession(!showAddSession)}
          className="flex-1"
          variant={showAddSession ? 'secondary' : 'primary'}
        >
          {showAddSession ? <FiX size={12} /> : <FiPlus size={12} />}
          <span>{showAddSession ? t('actions.cancel') : t('growth.addSession')}</span>
        </Button>
        {sessions.length > 0 && (
          <Button
            size="small"
            variant="secondary"
            onClick={() => setShowSessions(!showSessions)}
          >
            <FiClock size={12} />
          </Button>
        )}
      </div>

      {/* فرم افزودن session */}
      {showAddSession && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={sessionMinutes}
              onChange={(e) => setSessionMinutes(e.target.value)}
              placeholder={t('growth.minutes')}
              min="1"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <input
            type="text"
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder={t('growth.sessionNotes')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button size="small" onClick={handleAddSession} disabled={!sessionMinutes} className="w-full">
            <FiPlus size={12} />
            <span>{t('actions.add')}</span>
          </Button>
        </div>
      )}

      {/* لیست session ها */}
      {showSessions && sessions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5 max-h-40 overflow-y-auto scrollbar-thin">
          {sessions.slice().reverse().map(session => (
            <div key={session.id} className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded text-xs group">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  {formatNumber(session.minutes)} {t('growth.minutesShort')}
                </div>
                {session.notes && (
                  <div className="text-gray-500 dark:text-gray-400 truncate">{session.notes}</div>
                )}
              </div>
              <button
                onClick={() => dispatch(deleteSkillSession({ skillId: skill.id, sessionId: session.id }))}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

export default SkillCard