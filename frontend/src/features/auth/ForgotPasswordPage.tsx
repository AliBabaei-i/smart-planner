import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authService } from '../../services/authService'

export default function ForgotPasswordPage() {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    const result = await authService.forgotPassword(email)
    setLoading(false)

    if (result.success) {
      setSent(true)
      toast.success(result.message || 'ایمیل ارسال شد', { position: 'bottom-left' })
    } else {
      toast.error(result.message || 'خطا در ارسال درخواست', { position: 'bottom-left' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FiMail size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPersian ? 'فراموشی رمز عبور' : 'Forgot Password'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {isPersian
              ? 'ایمیلت رو وارد کن تا لینک بازیابی برات ارسال بشه'
              : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPersian
                ? 'اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی ارسال شد. لطفاً صندوق ورودی و پوشه اسپم خود را چک کنید.'
                : 'If this email is registered, a reset link has been sent. Please check your inbox and spam folder.'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              {isPersian
                ? '⚠️ در نسخه فعلی، لینک در کنسول سرور نمایش داده می‌شود (برای تست).'
                : '⚠️ In the current version, the link appears in the server console (for testing).'}
            </p>
            <Link to="/login" className="block">
              <Button variant="secondary" className="w-full">
                <FiArrowLeft size={16} />
                <span>{isPersian ? 'بازگشت به ورود' : 'Back to Login'}</span>
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={isPersian ? 'ایمیل' : 'Email'}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full !bg-primary-600 hover:!bg-primary-700"
            >
              <FiMail size={16} />
              <span>{isPersian ? 'ارسال لینک بازیابی' : 'Send Reset Link'}</span>
            </Button>
            <Link
              to="/login"
              className="block text-center text-sm text-primary-600 hover:underline dark:text-primary-400"
            >
              {isPersian ? 'بازگشت به ورود' : 'Back to Login'}
            </Link>
          </form>
        )}
      </Card>
    </div>
  )
}