import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiEdit3, FiArrowLeft, FiBookmark, FiPlus } from 'react-icons/fi'
import { getNoteColor } from './notesSlice'
import { formatRelativeTimeByLang } from '../../utils/formatters'

const NotesWidget = () => {
  const { t } = useTranslation()
  const { notes = [] } = useSelector(state => state.notes)

  // ✅ آخرین ۵ یادداشت (Pin شده‌ها اول)
  const recentNotes = [...notes]
    .filter(n => !n.archived)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    .slice(0, 5)

  if (recentNotes.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
          <FiEdit3 size={28} className="text-purple-400" />
        </div>
        <p className="text-sm mb-3">{t('notes.empty')}</p>
        <Link 
          to="/notes"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
        >
          <FiPlus size={14} />
          <span>{t('notes.createFirst')}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {recentNotes.map(note => {
        const colorData = getNoteColor(note.colorId)
        const isDefault = note.colorId === 'default'
        
        return (
          <Link
            key={note.id}
            to="/notes"
            className="block p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4"
            style={{ borderLeftColor: isDefault ? '#e5e7eb' : colorData.value }}
          >
            <div className="flex items-start gap-2">
              {note.pinned && (
                <FiBookmark size={12} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {note.title || t('notes.untitled')}
                  </h4>
                </div>
                {note.content && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {note.content}
                  </p>
                )}
                <div className="text-xs text-gray-400 mt-1">
                  {formatRelativeTimeByLang(note.updatedAt)}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
      <Link 
        to="/notes"
        className="text-center text-xs text-blue-600 dark:text-blue-400 hover:underline block pt-2"
      >
        {t('search.navigateTo')} →
      </Link>
    </div>
  )
}

export default NotesWidget