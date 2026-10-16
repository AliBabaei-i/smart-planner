import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FiSearch,
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiCalendar,
  FiBarChart2,
  FiAward,
  FiSettings,
  FiCheckCircle,
  FiCircle,
  FiActivity,
  FiEdit3,
  FiTarget
} from 'react-icons/fi'

const GlobalSearch = ({ isOpen, onClose }) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { tasks = [] } = useSelector(state => state.tasks)
  const { projects = [] } = useSelector(state => state.projects)
  const { notes = [] } = useSelector(state => state.notes || { notes: [] })
  const { habits = [] } = useSelector(state => state.habits || { habits: [] })
  const { goals = [] } = useSelector(state => state.goals || { goals: [] })
const { journals = [], skills = [] } = useSelector(state => state.growth || {})
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery('')
      setActiveIndex(0)
    }
  }, [isOpen])

  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return [
        { type: 'action', id: 'dashboard', title: t('nav.dashboard'), path: '/', Icon: FiHome, iconColor: 'text-gray-500' },
        { type: 'action', id: 'projects', title: t('nav.projects'), path: '/projects', Icon: FiFolder, iconColor: 'text-blue-500' },
        { type: 'action', id: 'tasks', title: t('nav.tasks'), path: '/tasks', Icon: FiCheckSquare, iconColor: 'text-green-500' },
        { type: 'action', id: 'habits', title: t('nav.habits'), path: '/habits', Icon: FiActivity, iconColor: 'text-orange-500' },
        { type: 'action', id: 'notes', title: t('nav.notes'), path: '/notes', Icon: FiEdit3, iconColor: 'text-purple-500' },
        { type: 'action', id: 'goals', title: t('nav.goals'), path: '/goals', Icon: FiTarget, iconColor: 'text-indigo-500' },
        
        { type: 'action', id: 'planning', title: t('nav.planning'), path: '/planning', Icon: FiCalendar, iconColor: 'text-teal-500' },
        { type: 'action', id: 'analytics', title: t('nav.analytics'), path: '/analytics', Icon: FiBarChart2, iconColor: 'text-indigo-500' },
        { type: 'action', id: 'achievements', title: t('nav.achievements'), path: '/achievements', Icon: FiAward, iconColor: 'text-yellow-500' },
        { type: 'action', id: 'settings', title: t('nav.settings'), path: '/settings', Icon: FiSettings, iconColor: 'text-gray-500' },
      ]
    }

    const lowerQuery = query.toLowerCase().trim()
    const results = []

    // Tasks
    tasks.forEach(task => {
      const matchTitle = task.title?.toLowerCase().includes(lowerQuery)
      const matchDesc = task.description?.toLowerCase().includes(lowerQuery)

      if (matchTitle || matchDesc) {
        const project = projects.find(p => p.id === task.projectId)
        results.push({
          type: 'task',
          id: `task-${task.id}`,
          title: task.title,
          subtitle: project?.name || t('tasks.form.selectProject'),
          path: '/tasks',
          Icon: task.completed ? FiCheckCircle : FiCircle,
          iconColor: task.completed ? 'text-green-500' : 'text-gray-400',
          data: task
        })
      }
    })

    // Projects
    projects.forEach(project => {
      const matchName = project.name?.toLowerCase().includes(lowerQuery)
      const matchDesc = project.description?.toLowerCase().includes(lowerQuery)

      if (matchName || matchDesc) {
        results.push({
          type: 'project',
          id: `project-${project.id}`,
          title: project.name,
          subtitle: project.description || t('projects.emptyDesc'),
          path: '/projects',
          Icon: FiFolder,
          iconColor: 'text-blue-500',
          data: project
        })
      }
    })

    // Notes
    notes.forEach(note => {
      const matchTitle = note.title?.toLowerCase().includes(lowerQuery)
      const matchContent = note.content?.toLowerCase().includes(lowerQuery)

      if (matchTitle || matchContent) {
        results.push({
          type: 'note',
          id: `note-${note.id}`,
          title: note.title || t('notes.untitled'),
          subtitle: note.content?.substring(0, 50) || '',
          path: '/notes',
          Icon: FiEdit3,
          iconColor: 'text-purple-500',
          data: note
        })
      }
    })

    // Habits
    habits.forEach(habit => {
      const matchName = habit.name?.toLowerCase().includes(lowerQuery)
      const matchDesc = habit.description?.toLowerCase().includes(lowerQuery)

      if (matchName || matchDesc) {
        results.push({
          type: 'habit',
          id: `habit-${habit.id}`,
          title: habit.name,
          subtitle: habit.description || t('habits.subtitle'),
          path: '/habits',
          Icon: FiActivity,
          iconColor: 'text-orange-500',
          data: habit
        })
      }
    })

    // Goals
    goals.forEach(goal => {
      const matchTitle = goal.title?.toLowerCase().includes(lowerQuery)
      const matchDesc = goal.description?.toLowerCase().includes(lowerQuery)

      if (matchTitle || matchDesc) {
        results.push({
          type: 'goal',
          id: `goal-${goal.id}`,
          title: goal.title,
          subtitle: goal.description?.substring(0, 50) || '',
          path: '/goals',
          Icon: FiTarget,
          iconColor: 'text-indigo-500',
          data: goal
        })
      }
    })
// Journals
journals.forEach(journal => {
  if (
    journal.reflection?.toLowerCase().includes(lowerQuery) ||
    journal.gratitude?.toLowerCase().includes(lowerQuery)
  ) {
    results.push({
      type: 'journal',
      id: `journal-${journal.id}`,
      title: journal.date,
      subtitle: journal.reflection?.substring(0, 50) || '',
      path: '/growth',
      Icon: FiBookOpen,
      iconColor: 'text-purple-500',
      data: journal
    })
  }
})

// Skills
skills.forEach(skill => {
  if (
    skill.name?.toLowerCase().includes(lowerQuery) ||
    skill.description?.toLowerCase().includes(lowerQuery)
  ) {
    results.push({
      type: 'skill',
      id: `skill-${skill.id}`,
      title: skill.name,
      subtitle: skill.description?.substring(0, 50) || '',
      path: '/growth',
      Icon: FiAward,
      iconColor: 'text-blue-500',
      data: skill
    })
  }
})
    // Menu
    const menuItems = [
      { title: t('nav.dashboard'), path: '/', Icon: FiHome },
      { title: t('nav.projects'), path: '/projects', Icon: FiFolder },
      { title: t('nav.tasks'), path: '/tasks', Icon: FiCheckSquare },
      { title: t('nav.habits'), path: '/habits', Icon: FiActivity },
      { title: t('nav.notes'), path: '/notes', Icon: FiEdit3 },
      { title: t('nav.goals'), path: '/goals', Icon: FiTarget },
      { title: t('nav.growth'), path: '/growth', Icon: FiTrendingUp },
      { title: t('nav.planning'), path: '/planning', Icon: FiCalendar },
      { title: t('nav.analytics'), path: '/analytics', Icon: FiBarChart2 },
      { title: t('nav.achievements'), path: '/achievements', Icon: FiAward },
      { title: t('nav.settings'), path: '/settings', Icon: FiSettings }
    ]

    menuItems.forEach(item => {
      if (item.title.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'navigation',
          id: `nav-${item.path}`,
          title: item.title,
          subtitle: t('search.navigateTo'),
          path: item.path,
          Icon: item.Icon,
          iconColor: 'text-gray-500'
        })
      }
    })

    return results.slice(0, 10)
  }, [query, tasks, projects, notes, habits, goals, t])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex(prev => prev < searchResults.length - 1 ? prev + 1 : prev)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex(prev => prev > 0 ? prev - 1 : 0)
      } else if (e.key === 'Enter' && searchResults[activeIndex]) {
        e.preventDefault()
        handleSelectResult(searchResults[activeIndex])
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, activeIndex, searchResults])

  const handleSelectResult = (result) => {
    navigate(result.path)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-[10vh] z-[100] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 gap-3">
          <FiSearch size={20} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveIndex(0) }}
            placeholder={t('search.placeholder')}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
          />
          <kbd className="hidden md:flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded border border-gray-300 dark:border-gray-600">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiSearch size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{t('search.noResults')}</p>
              <p className="text-xs mt-1">{t('search.noResultsDesc')}</p>
            </div>
          ) : (
            <div className="p-2">
              <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {query === '' ? t('search.quickAccess') : `${t('search.results')} (${searchResults.length})`}
              </div>
              {searchResults.map((result, index) => {
                const IconComponent = result.Icon
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelectResult(result)}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`w-full text-start flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                      index === activeIndex
                        ? 'bg-blue-50 dark:bg-blue-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                      <IconComponent size={20} className={result.iconColor || 'text-gray-500'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {result.title}
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                    {result.type && result.type !== 'action' && result.type !== 'navigation' && (
                      <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                        {result.type === 'task' ? t('search.task')
                          : result.type === 'project' ? t('search.project')
                          : result.type === 'note' ? t('search.note')
                          : result.type === 'habit' ? t('search.habit')
                          : result.type === 'goal' ? t('search.goal')
                          : ''}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">↑↓</kbd>
              <span>{t('search.hint.move')}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Enter</kbd>
              <span>{t('search.hint.select')}</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Esc</kbd>
              <span>{t('search.hint.close')}</span>
            </span>
          </div>
          <span className="hidden md:inline">{searchResults.length} {t('search.results')}</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalSearch