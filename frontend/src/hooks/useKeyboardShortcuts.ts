import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

interface ShortcutsConfig {
  onOpenSearch: () => void
  onOpenQuickAdd: () => void
}

export const useKeyboardShortcuts = (config: ShortcutsConfig) => {
  const navigate = useNavigate()

  const isTypingInInput = useCallback((target: EventTarget | null): boolean => {
    if (!target) return false
    const el = target as HTMLElement
    const tag = el.tagName?.toLowerCase()
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      el.isContentEditable === true
    )
  }, [])

  useEffect(() => {
    let pendingG = false
    let gTimeout: ReturnType<typeof setTimeout> | null = null

    const clearPendingG = () => {
      pendingG = false
      if (gTimeout) {
        clearTimeout(gTimeout)
        gTimeout = null
      }
    }

    const handler = (e: KeyboardEvent) => {
      const isInInput = isTypingInInput(e.target)
      const mod = e.ctrlKey || e.metaKey

      // Ctrl/Cmd + K → search (همه‌جا)
      if (mod && e.code === 'KeyK') {
        e.preventDefault()
        config.onOpenSearch()
        return
      }

      // Esc → پاک کردن pendingG
      if (e.key === 'Escape') {
        clearPendingG()
        return
      }

      if (isInInput) return

      // / → search
      if (e.key === '/') {
        e.preventDefault()
        config.onOpenSearch()
        return
      }

      // ? → صفحه تنظیمات (که Card راهنمای میان‌برها دارد)
      if (e.key === '?') {
        e.preventDefault()
        navigate('/settings')
        return
      }

      // N → quick add
      if (!mod && !e.altKey && e.code === 'KeyN') {
        e.preventDefault()
        config.onOpenQuickAdd()
        return
      }

      // G → pending، بعد حرف دوم → navigate
      if (e.code === 'KeyG' && !mod && !e.altKey && !pendingG) {
        pendingG = true
        if (gTimeout) clearTimeout(gTimeout)
        gTimeout = setTimeout(clearPendingG, 1200)
        return
      }

      if (pendingG) {
        const routes: Record<string, string> = {
          KeyD: '/',
          KeyP: '/projects',
          KeyT: '/tasks',
          KeyH: '/habits',
          KeyN: '/notes',
          KeyG: '/goals',
          KeyR: '/growth',
          KeyC: '/planning',
          KeyA: '/analytics',
          KeyF: '/finance',
          KeyS: '/settings',
        }
        const path = routes[e.code]
        if (path) {
          e.preventDefault()
          navigate(path)
        }
        clearPendingG()
      }
    }

    document.addEventListener('keydown', handler)
    return () => {
      document.removeEventListener('keydown', handler)
      if (gTimeout) clearTimeout(gTimeout)
    }
  }, [config, navigate, isTypingInInput])
}

export default useKeyboardShortcuts