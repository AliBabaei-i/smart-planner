import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('smart-planner-install-dismissed') === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    // ✅ چک کن آیا از قبل نصب شده
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // ✅ تشخیص رویداد نصب
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice

    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
      return true
    }
    return false
  }

  const dismiss = () => {
    setIsDismissed(true)
    try {
      localStorage.setItem('smart-planner-install-dismissed', 'true')
    } catch {}
  }

  return {
    canInstall: !!deferredPrompt && !isInstalled && !isDismissed,
    isInstalled,
    isDismissed,
    promptInstall,
    dismiss
  }
}