import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import {
  signInUser,
  signUpUser,
  clearError,
  selectAuthLoading,
  selectAuthError,
  selectIsAuthenticated
} from './authSlice'

export default function LoginPage() {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const loading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  const isAuthenticated = useSelector(selectIsAuthenticated)

  const [mode, setMode] = useState('signin')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [mode, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error, { position: 'bottom-left', autoClose: 3000 })
    }
  }, [error])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (mode === 'signin') {
      if (!formData.email || !formData.password) {
        toast.error(isPersian ? 'ایمیل و رمز عبور الزامی است' : 'Email and password required')
        return
      }
      await dispatch(signInUser({
        email: formData.email,
        password: formData.password
      }))
    } else {
      if (!formData.email || !formData.password || !formData.name) {
        toast.error(isPersian ? 'همه فیلدها الزامی است' : 'All fields required')
        return
      }
      if (formData.password.length < 6) {
        toast.error(isPersian ? 'رمز عبور باید حداقل ۶ کاراکتر باشد' : 'Password must be at least 6 chars')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error(isPersian ? 'رمزها یکسان نیستند' : 'Passwords do not match')
        return
      }
      await dispatch(signUpUser({
        email: formData.email,
        password: formData.password,
        name: formData.name
      }))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            SP
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPersian ? 'برنامه‌ریزی هوشمند' : 'Smart Planner'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {mode === 'signin'
              ? (isPersian ? 'به حسابت خوش آمدی' : 'Welcome back')
              : (isPersian ? 'حساب جدید بساز' : 'Create a new account')}
          </p>
        </div>

        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setMode('signin')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'signin'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {isPersian ? 'ورود' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'signup'
                ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {isPersian ? 'ثبت‌نام' : 'Sign Up'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <Input
              label={isPersian ? 'نام' : 'Name'}
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={isPersian ? 'نام کامل' : 'Full name'}
              required
            />
          )}

          <Input
            label={isPersian ? 'ایمیل' : 'Email'}
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <Input
            label={isPersian ? 'رمز عبور' : 'Password'}
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="••••••••"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />

          {mode === 'signup' && (
            <Input
              label={isPersian ? 'تکرار رمز عبور' : 'Confirm Password'}
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full !bg-primary-600 hover:!bg-primary-700"
          >
            {mode === 'signin'
              ? (isPersian ? 'ورود به حساب' : 'Sign In')
              : (isPersian ? 'ساخت حساب' : 'Create Account')}
          </Button>
        </form>

        {mode === 'signin' && (
          <Link
            to="/forgot-password"
            className="block text-center text-sm text-primary-600 hover:underline dark:text-primary-400 mt-4"
          >
            {isPersian ? 'رمز عبور را فراموش کردی؟' : 'Forgot password?'}
          </Link>
        )}

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          {isPersian ? 'با ورود، قوانین ما را می‌پذیری' : 'By signing in, you accept our terms'}
        </p>
      </Card>
    </div>
  )
}