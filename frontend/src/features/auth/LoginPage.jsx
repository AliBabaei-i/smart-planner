import React, { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
  FiMail, FiLock, FiUser, FiEye, FiEyeOff,
  FiLogIn, FiUserPlus, FiGlobe
} from 'react-icons/fi'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import {
  signUpUser,
  signInUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated
} from './authSlice'

const LoginPage = () => {
  const { i18n } = useTranslation()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const isLoading = useSelector(selectAuthLoading)
  const authError = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [mode, setMode] = useState('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const from = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    if (authError) {
      toast.error(authError, {
        position: 'bottom-left',
        autoClose: 4000
      })
      dispatch(clearError())
    }
  }, [authError, dispatch])

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()

    if (!formData.email.trim()) {
      toast.error(isPersian ? 'ایمیل الزامی است' : 'Email is required')
      return
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error(isPersian ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 characters')
      return
    }
    if (mode === 'signup' && !formData.name.trim()) {
      toast.error(isPersian ? 'نام الزامی است' : 'Name is required')
      return
    }

    try {
      if (mode === 'signup') {
        await dispatch(signUpUser(formData)).unwrap()
        toast.success(
          isPersian ? 'ثبت‌نام موفق! خوش آمدی' : 'Sign up successful! Welcome',
          { position: 'bottom-left', autoClose: 3000 }
        )
      } else {
        await dispatch(signInUser(formData)).unwrap()
        toast.success(
          isPersian ? 'خوش آمدی!' : 'Welcome back!',
          { position: 'bottom-left', autoClose: 2500 }
        )
      }
    } catch (error) {
      // خطا از useEffect نمایش داده می‌شه
    }
  }, [formData, mode, dispatch, isPersian])

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin')
    setFormData({ name: '', email: '', password: '' })
  }, [])

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(isPersian ? 'en' : 'fa')
  }, [i18n, isPersian])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, #10b981 0%, transparent 50%),
                            radial-gradient(circle at 80% 70%, #3b82f6 0%, transparent 50%)`
        }} />
      </div>

      <button
        onClick={toggleLanguage}
        className="fixed top-4 end-4 p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm z-10"
      >
        <div className="flex items-center gap-1.5">
          <FiGlobe size={16} />
          <span className="text-xs font-medium">{isPersian ? 'EN' : 'فا'}</span>
        </div>
      </button>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isPersian ? 'برنامه‌ریزی هوشمند' : 'Smart Planner'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {mode === 'signin'
              ? (isPersian ? 'به حسابت وارد شو' : 'Sign in to your account')
              : (isPersian ? 'حساب جدید بساز' : 'Create your account')}
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {isPersian ? 'نام' : 'Name'}
                </label>
                <div className="relative">
                  <FiUser size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder={isPersian ? 'مثلاً: علی' : 'e.g., Ali'}
                    className="w-full ps-10 pe-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    disabled={isLoading}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isPersian ? 'ایمیل' : 'Email'}
              </label>
              <div className="relative">
                <FiMail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                  className="w-full ps-10 pe-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {isPersian ? 'رمز عبور' : 'Password'}
              </label>
              <div className="relative">
                <FiLock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-10 pe-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  disabled={isLoading}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isPersian ? 'حداقل ۶ کاراکتر' : 'At least 6 characters'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full !bg-emerald-600 hover:!bg-emerald-700 py-2.5"
            >
              {mode === 'signin' ? (
                <>
                  <FiLogIn size={16} />
                  <span>{isPersian ? 'ورود' : 'Sign In'}</span>
                </>
              ) : (
                <>
                  <FiUserPlus size={16} />
                  <span>{isPersian ? 'ثبت‌نام' : 'Sign Up'}</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === 'signin' ? (
              <>
                {isPersian ? 'حساب نداری؟' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {isPersian ? 'ثبت‌نام کن' : 'Sign up'}
                </button>
              </>
            ) : (
              <>
                {isPersian ? 'حساب داری؟' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  {isPersian ? 'وارد شو' : 'Sign in'}
                </button>
              </>
            )}
          </div>
        </Card>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          {isPersian
            ? 'با ورود، شرایط استفاده را می‌پذیری'
            : 'By signing in, you agree to our Terms'}
        </p>
      </div>
    </div>
  )
}

export default LoginPage