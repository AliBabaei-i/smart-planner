import React, { memo } from 'react'
import { FiX } from 'react-icons/fi'

interface TagBadgeProps {
  tag: string
  onRemove?: () => void
  color?: string
  size?: 'small' | 'default'
}

const TagBadge = memo(({ tag, onRemove, color = '#3b82f6', size = 'default' }: TagBadgeProps) => {
  const sizeClasses = size === 'small'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-xs px-2 py-1 gap-1.5'

  return (
    <span
      className={`inline-flex items-center rounded-md font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
    >
      <span className="truncate max-w-[120px]">{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          aria-label={`حذف ${tag}`}
        >
          <FiX size={size === 'small' ? 10 : 12} />
        </button>
      )}
    </span>
  )
})

TagBadge.displayName = 'TagBadge'

export default TagBadge