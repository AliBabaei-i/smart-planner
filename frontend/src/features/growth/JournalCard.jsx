import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiEdit2,
  FiTrash2,
  FiSmile,
  FiZap,
  FiStar,
  FiAlertTriangle,
  FiCalendar,
  FiHeart
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import { formatDateByLang, formatNumber } from '../../utils/formatters'

const MOOD_EMOJI = { 1: '😢', 2: '😐', 3: '🙂', 4: '😊', 5: '😄' }
const ENERGY_EMOJI = { 1: '🪫', 2: '🔋', 3: '⚡', 4: '🔥', 5: '💥' }

const JournalCard = ({ journal, onEdit, onDelete, onClick }) => {
  const { t } = useTranslation()

  return (
    <Card className="p-4 hover:shadow-lg transition-all cursor-pointer group" onClick={onClick}>
      {/* هدر */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <FiCalendar size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {formatDateByLang(journal.date)}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <FiSmile size={10} />
                {MOOD_EMOJI[journal.mood]}
              </span>
              <span className="text-xs flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <FiZap size={10} />
                {ENERGY_EMOJI[journal.energy]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.() }}
            className="text-gray-400 hover:text-blue-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.edit')}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.() }}
            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title={t('actions.delete')}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>

      {/* دستاوردها */}
      {journal.wins && journal.wins.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 mb-1">
            <FiStar size={10} />
            <span>{t('growth.wins')}</span>
          </div>
          <ul className="space-y-0.5">
            {journal.wins.slice(0, 3).map((w, i) => (
              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="flex-1">{w}</span>
              </li>
            ))}
            {journal.wins.length > 3 && (
              <li className="text-xs text-gray-400 ps-3">
                +{formatNumber(journal.wins.length - 3)} {t('growth.more')}
              </li>
            )}
          </ul>
        </div>
      )}

      {/* چالش‌ها */}
      {journal.challenges && journal.challenges.length > 0 && (
        <div className="mb-2">
          <div className="flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400 mb-1">
            <FiAlertTriangle size={10} />
            <span>{t('growth.challenges')}</span>
          </div>
          <ul className="space-y-0.5">
            {journal.challenges.slice(0, 2).map((c, i) => (
              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                <span className="text-orange-500 mt-0.5">•</span>
                <span className="flex-1">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* بازتاب */}
      {journal.reflection && (
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          {journal.reflection}
        </p>
      )}

      {/* سپاسگزاری */}
      {journal.gratitude && (
        <div className="flex items-start gap-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <FiHeart size={12} className="text-pink-500 flex-shrink-0 mt-0.5" />
          <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 italic">
            {journal.gratitude}
          </span>
        </div>
      )}
    </Card>
  )
}

export default JournalCard