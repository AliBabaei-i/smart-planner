import React, { useState, useCallback, memo, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { FiPlus } from 'react-icons/fi'
import TagBadge from './TagBadge'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
  suggestions?: string[]
  maxTags?: number
}

const TagInput = memo(({
  value = [],
  onChange,
  placeholder,
  label,
  suggestions = [],
  maxTags = 20,
}: TagInputProps) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const [inputValue, setInputValue] = useState('')

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    if (value.includes(trimmed)) return
    if (value.length >= maxTags) return

    onChange([...value, trimmed])
    setInputValue('')
  }, [value, onChange, maxTags])

  const removeTag = useCallback((tag: string) => {
    onChange(value.filter(t => t !== tag))
  }, [value, onChange])

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }, [inputValue, value, addTag, removeTag])

  const availableSuggestions = suggestions.filter(s => !value.includes(s)).slice(0, 8)

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}

      <div className="w-full min-h-[42px] px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all">
        {value.map(tag => (
          <TagBadge key={tag} tag={tag} onRemove={() => removeTag(tag)} size="small" />
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={value.length === 0 ? (placeholder || (isPersian ? 'افزودن تگ...' : 'Add tag...')) : ''}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none py-1"
        />

        {inputValue.trim() && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="p-1 rounded text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
            title={isPersian ? 'افزودن' : 'Add'}
          >
            <FiPlus size={14} />
          </button>
        )}
      </div>

      {availableSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {availableSuggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="text-[10px] px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

TagInput.displayName = 'TagInput'

export default TagInput