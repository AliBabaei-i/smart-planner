import React, { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiLock, FiCheckCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { authService } from '../../services/authService'

export default function ResetPasswordPage() {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error(isPersian ? 'رمز باید حداقل ۸ کاراکتر باشد' : 'Password must be at least 8 chars')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error(isPersian ? 'رمزها یکسان نیستند' : 'Passwords do not match')
      return
    }

    setLoading(true)
    const result = await authService.resetPassword(token, newPassword)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
      toast.success(isPersian ? 'رمز تغییر کرد' : 'Password changed', { position: 'bottom-left' })
      setTimeout(() => navigate('/login'), 2500)
    } else {
      toast.error(result.message || 'خطا در بازنشانی رمز')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md p-8 text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            {isPersian ? 'لینک نامعتبر' : 'Invalid Link'}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {isPersian ? 'توکن بازیابی در URL وجود ندارد.' : 'Reset token is missing.'}
          </p>
          <Link to="/forgot-password">
            <Button variant="secondary">{isPersian ? 'درخواست جدید' : 'Request New'}</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
            <FiLock size={28} className="text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPersian ? 'بازنشانی رمز عبور' : 'Reset Password'}
          </h1>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <FiCheckCircle size={32} className="text-green-600" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPersian ? 'رمز با موفقیت تغییر کرد. در حال انتقال به صفحه ورود...' : 'Password changed. Redirecting...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={isPersian ? 'رمز جدید' : 'New Password'}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
            />
            <Input
              label={isPersian ? 'تکرار رمز جدید' : 'Confirm Password'}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full !bg-primary-600 hover:!bg-primary-700"
            >
              <FiLock size={16} />
              <span>{isPersian ? 'تغییر رمز' : 'Change Password'}</span>
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}