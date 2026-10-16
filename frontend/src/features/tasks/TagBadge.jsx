import React from 'react'
import { FiTag, FiX } from 'react-icons/fi'

const TAG_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300' },
  { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
  { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
]

const getTagColor = (tag) => {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash)
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

const TagBadge = ({ tag, onRemove, onClick, clickable = false }) => {
  const color = getTagColor(tag)

  return (
    <span
      className={`
        inline-flex items-center gap-1 
        px-2 py-0.5 rounded-md text-xs font-medium
        ${color.bg} ${color.text}
        ${clickable ? 'cursor-pointer hover:opacity-80' : ''}
        transition-opacity
      `}
      onClick={onClick}
      title={tag}
    >
      <FiTag size={10} className="flex-shrink-0" />
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="ms-0.5 hover:opacity-70"
        >
          <FiX size={10} />
        </button>
      )}
    </span>
  )
}

export default TagBadge
export { getTagColor }