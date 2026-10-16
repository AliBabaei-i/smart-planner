import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiTag, FiArrowLeft } from 'react-icons/fi'
import TagBadge from '../../tasks/TagBadge'

const TagsWidget = () => {
  const { t } = useTranslation()
  const { tasks = [], availableTags = [] } = useSelector(state => state.tasks)

  const getTagCount = (tag) => {
    return tasks.filter(task => task.tags && task.tags.includes(tag)).length
  }

  const topTags = [...availableTags]
    .map(tag => ({ tag, count: getTagCount(tag) }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)

  if (topTags.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 mx-auto bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
          <FiTag size={28} className="text-purple-400" />
        </div>
        <p className="text-sm">{t('tasks.form.tags')}</p>
        <p className="text-xs mt-1">{t('tasks.form.subtaskHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {topTags.map(({ tag, count }) => (
        <Link
          key={tag}
          to="/tasks"
          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <TagBadge tag={tag} />
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
            {count}
          </span>
        </Link>
      ))}
      <Link 
        to="/tasks"
        className="text-center text-xs text-blue-600 dark:text-blue-400 hover:underline block pt-2"
      >
        {t('search.navigateTo')} →
      </Link>
    </div>
  )
}

export default TagsWidget