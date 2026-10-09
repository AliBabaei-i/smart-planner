import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  FiEdit2,
  FiTrash2,
  FiArchive,
  FiTag,
  FiCheckCircle,
  FiCircle,
  FiBookmark,
  FiCopy
} from 'react-icons/fi'
import { getNoteColor } from './notesSlice'
import { formatRelativeTimeByLang } from '../../utils/formatters'

const NoteCard = ({ 
  note, 
  onEdit, 
  onDelete, 
  onTogglePin, 
  onToggleArchive,
  onToggleChecklist,
  onCopy,
  onTagClick,
  compact = false
}) => {
  const { t, i18n } = useTranslation()
  const colorData = getNoteColor(note.colorId)

  // ✅ دریافت پس‌زمینه بر اساس تم
  const getBackgroundColor = () => {
    if (note.colorId === 'default') return 'bg-white dark:bg-gray-800'
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? colorData.dark : colorData.value
  }

  // ✅ متن رنگ مناسب
  const getTextColor = () => {
    if (note.colorId === 'default') {
      return 'text-gray-900 dark:text-white'
    }
    const isDark = document.documentElement.classList.contains('dark')
    return isDark ? 'text-white' : 'text-gray-900'
  }

  // ✅ محاسبه checklist progress
  const checklistStats = {
    total: note.checklist?.length || 0,
    done: note.checklist?.filter(i => i.done).length || 0
  }
  const checklistProgress = checklistStats.total > 0 
    ? Math.round((checklistStats.done / checklistStats.total) * 100) 
    : 0

  return (
    <div 
      className={`
        rounded-xl p-4 transition-all hover:shadow-lg border-2 group
        ${getBackgroundColor()} ${colorData.border}
        ${note.pinned ? 'ring-2 ring-yellow-400 dark:ring-yellow-500' : ''}
        ${compact ? 'text-sm' : ''}
      `}
    >
      {/* هدر */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          {note.title && (
            <h3 className={`font-bold mb-1 ${getTextColor()} ${compact ? 'text-sm' : 'text-base'} line-clamp-2`}>
              {note.title}
            </h3>
          )}
        </div>
        
        {/* Pin icon */}
        {note.pinned && (
          <FiBookmark size={14} className="text-yellow-500 flex-shrink-0" />
        )}
      </div>

      {/* محتوا */}
      {note.content && (
        <p className={`text-sm mb-3 whitespace-pre-wrap break-words ${getTextColor()} opacity-90 line-clamp-6`}>
          {note.content}
        </p>
      )}

      {/* Checklist */}
      {checklistStats.total > 0 && (
        <div className="mb-3 space-y-1.5">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className={`${getTextColor()} opacity-70`}>
              {checklistStats.done}/{checklistStats.total}
            </span>
            <span className={`${getTextColor()} opacity-70`}>{checklistProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
            <div 
              className="bg-green-500 h-1.5 rounded-full transition-all"
              style={{ width: `${checklistProgress}%` }}
            />
          </div>

          {/* لیست آیتم‌ها */}
          <div className="space-y-1">
            {note.checklist.slice(0, 4).map(item => (
              <button
                key={item.id}
                onClick={() => onToggleChecklist?.(note.id, item.id)}
                className="flex items-start gap-2 text-start w-full hover:bg-black/5 dark:hover:bg-white/5 rounded p-1 transition-colors"
              >
                {item.done ? (
                  <FiCheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <FiCircle size={14} className={`${getTextColor()} opacity-50 flex-shrink-0 mt-0.5`} />
                )}
                <span className={`text-xs flex-1 ${item.done ? 'line-through opacity-50' : ''} ${getTextColor()}`}>
                  {item.text}
                </span>
              </button>
            ))}
            {note.checklist.length > 4 && (
              <div className={`text-xs ${getTextColor()} opacity-60 ps-5`}>
                + {note.checklist.length - 4} {t('notes.moreItems')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.slice(0, 3).map(tag => (
            <button
              key={tag}
              onClick={() => onTagClick?.(tag)}
              className={`text-xs px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 ${getTextColor()} hover:bg-black/20 dark:hover:bg-white/20 transition-colors flex items-center gap-1`}
            >
              <FiTag size={8} />
              <span>{tag}</span>
            </button>
          ))}
          {note.tags.length > 3 && (
            <span className={`text-xs ${getTextColor()} opacity-60 px-1`}>
              +{note.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* فوتر */}
      <div className={`flex items-center justify-between pt-2 border-t ${note.colorId === 'default' ? 'border-gray-100 dark:border-gray-700' : 'border-black/10 dark:border-white/10'}`}>
        <span className={`text-xs ${getTextColor()} opacity-60`}>
          {formatRelativeTimeByLang(note.updatedAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onTogglePin?.(note.id)}
            className={`${getTextColor()} opacity-70 hover:opacity-100 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            title={note.pinned ? t('notes.unpin') : t('notes.pin')}
          >
            <FiBookmark size={14} />
          </button>
          <button
            onClick={() => onCopy?.(note)}
            className={`${getTextColor()} opacity-70 hover:opacity-100 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            title={t('notes.copy')}
          >
            <FiCopy size={14} />
          </button>
          <button
            onClick={() => onEdit?.(note)}
            className={`${getTextColor()} opacity-70 hover:opacity-100 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            title={t('actions.edit')}
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => onToggleArchive?.(note.id)}
            className={`${getTextColor()} opacity-70 hover:opacity-100 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            title={note.archived ? t('notes.unarchive') : t('notes.archive')}
          >
            <FiArchive size={14} />
          </button>
          <button
            onClick={() => onDelete?.(note)}
            className={`${getTextColor()} opacity-70 hover:text-red-500 p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
            title={t('actions.delete')}
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default NoteCard