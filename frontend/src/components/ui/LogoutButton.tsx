import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FiLogOut } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { authService } from '../../services/authService'

interface LogoutButtonProps {
  variant?: 'icon' | 'full'
  className?: string
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ variant = 'full', className = '' }) => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    const confirmed = window.confirm(
      isPersian
        ? 'آیا مطمئنی می‌خوای خارج بشی؟ داده‌های آفلاین پاک می‌شن (ولی توی سرور محفوظن).'
        : 'Are you sure? Offline data will be cleared (server data is safe).'
    )
    if (!confirmed) return

    setLoading(true)
    try {
      await authService.signOut()
      toast.success(
        isPersian ? 'با موفقیت خارج شدی' : 'Logged out successfully',
        { position: 'bottom-left', autoClose: 2000 }
      )
      // ✅ رفرش کامل — استور و persist از صفر شروع می‌شن
      window.location.href = '/login'
    } catch (error) {
      toast.error(isPersian ? 'خطا در خروج' : 'Logout failed')
      setLoading(false)
    }
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleLogout}
        disabled={loading}
        className={`p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors ${className}`}
        title={isPersian ? 'خروج' : 'Logout'}
      >
        <FiLogOut size={18} />
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 ${className}`}
    >
      <FiLogOut size={16} />
      <span>{loading ? '...' : (isPersian ? 'خروج از حساب' : 'Logout')}</span>
    </button>
  )
}

export default LogoutButton