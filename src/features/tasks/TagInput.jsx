import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { FiTag, FiX, FiPlus } from 'react-icons/fi'

const TagInput = ({ tags = [], onChange, placeholder = null }) => {
  const { t } = useTranslation()
  const { availableTags = [] } = useSelector(state => state.tasks)
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const wrapperRef = useRef(null)

  const defaultPlaceholder = placeholder || t('tasks.form.tagPlaceholder') || 'افزودن تگ...'

  // ✅ بستن suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ✅ فیلتر suggestions
  const suggestions = availableTags
    .filter(tag => 
      !tags.includes(tag) && 
      (input === '' || tag.toLowerCase().includes(input.toLowerCase()))
    )
    .slice(0, 5)

  // ✅ افزودن تگ
  const addTag = (tag) => {
    const trimmedTag = tag.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag])
      setInput('')
      setShowSuggestions(false)
    }
  }

  // ✅ حذف تگ
  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove))
  }

  // ✅ کلیدها
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (input.trim()) {
        addTag(input)
      }
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div 
        className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors min-h-[42px] cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* تگ‌های انتخاب شده */}
        {tags.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm"
          >
            <FiTag size={10} />
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="hover:text-blue-900 dark:hover:text-blue-100 ms-0.5"
              title={t('actions.delete')}
            >
              <FiX size={12} />
            </button>
          </span>
        ))}

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value)
            setShowSuggestions(true)
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? defaultPlaceholder : ''}
          className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm py-1"
        />
      </div>

      {/* راهنما با ترجمه */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {t('tasks.form.tagInputHint')}
      </div>

      {/* Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 inset-x-0 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
          <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-600 flex items-center gap-1.5">
            <FiTag size={12} />
            <span>{t('tasks.form.availableTags')}</span>
          </div>
          {suggestions.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => addTag(tag)}
              className="w-full text-start px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <FiTag size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">{tag}</span>
              <FiPlus size={12} className="text-gray-400 ms-auto" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagInput