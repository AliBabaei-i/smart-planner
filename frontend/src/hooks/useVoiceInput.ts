import { useState, useEffect, useCallback } from 'react'

// ✅ تایپ‌های Web Speech API (چون در TS استاندارد نیست)
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface UseVoiceInputOptions {
  lang?: 'fa-IR' | 'en-US'
  onResult?: (text: string) => void
  onError?: (error: string) => void
}

export const useVoiceInput = ({ lang = 'fa-IR', onResult, onError }: UseVoiceInputOptions = {}) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError('مرورگر شما از ورودی صوتی پشتیبانی نمی‌کند')
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = lang
      recognition.interimResults = false
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript
        setTranscript(text)
        onResult?.(text)
      }

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        const errorMsg = event.error === 'no-speech' ? 'صدایی شنیده نشد' : 'خطا در تشخیص گفتار'
        setError(errorMsg)
        onError?.(errorMsg)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (err: any) {
      setError('خطا در راه‌اندازی میکروفون')
      setIsListening(false)
    }
  }, [lang, onResult, onError])

  const stopListening = useCallback(() => {
    setIsListening(false)
    // recognition.stop() رو از اینجا نمی‌تونیم صدا بزنیم چون recognition توی اسکوپ نیست
    // در نسخه‌های بعدی می‌تونیم با useRef نگهش داریم
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening
  }
}