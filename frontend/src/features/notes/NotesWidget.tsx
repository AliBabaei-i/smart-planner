import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiEdit3, FiBookmark, FiPlus } from 'react-icons/fi'
import { getNoteColor } from './notesSlice'
import { formatRelativeTimeByLang } from '../../utils/formatters'
import type { RootState } from '../../app/store'

const NotesWidget: React.FC = () => {
  const { t } = useTranslation()
  const notes = useSelector((s: RootState) => (s as any).notes?.notes ?? []) as any[]

  const recentNotes = [...notes]
    .filter((n) => !n.archived)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
    .slice(0, 5)

  if (recentNotes.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <div className="w-14 h-14 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
          <FiEdit3 size={24} className="text-purple-400" />
        </div>
        <p className="text-xs mb-2">{t('notes.empty')}</p>
        <Link to="/notes" className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-medium hover:underline">
          <FiPlus size={12} />
          <span>{t('notes.createFirst')}</span>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {recentNotes.map((note) => {
        // ✅ getNoteColor ممکن است string یا object برگرداند — هر دو را پشتیبانی کن
        const color = getNoteColor(note.colorId) as any
        const colorValue: string =
          typeof color === 'string' ? color : (color?.value || '#e5e7eb')

        return (
          <Link
            key={note.id}
            to="/notes"
            className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-s-4"
            style={{ borderInlineStartColor: colorValue }}
          >
            <div className="flex items-start gap-1.5">
              {note.pinned && (
                <FiBookmark size={11} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {note.title || t('notes.untitled')}
                </h4>
                {note.content && (
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                    {note.content}
                  </p>
                )}
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {formatRelativeTimeByLang(note.updatedAt)}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
      <Link to="/notes" className="text-center text-[10px] text-blue-600 dark:text-blue-400 hover:underline block pt-1">
        {t('search.navigateTo')} →
      </Link>
    </div>
  )
}

export default NotesWidget