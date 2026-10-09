import React from 'react'
import { FiAlertTriangle, FiRefreshCw, FiTrash2 } from 'react-icons/fi'
import Button from '../ui/Button'
import Card from '../ui/Card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    this.setState({ error, errorInfo })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    if (window.confirm('تمام داده‌ها پاک خواهد شد. مطمئن هستید؟')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="p-8 max-w-lg w-full text-center">
            <div className="w-20 h-20 mx-auto bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <FiAlertTriangle size={40} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              متأسفانه خطایی رخ داد
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              یک خطای غیرمنتظره در برنامه رخ داده است. لطفاً صفحه را دوباره بارگذاری کنید.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-start">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  جزئیات خطا (فقط در حالت توسعه)
                </summary>
                <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded text-xs text-red-700 dark:text-red-300 overflow-auto max-h-40 text-left" dir="ltr">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={this.handleReload}>
                <FiRefreshCw size={16} />
                <span>بارگذاری مجدد</span>
              </Button>
              <Button variant="secondary" onClick={this.handleReset}>
                <FiTrash2 size={16} />
                <span>پاک کردن داده‌ها</span>
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary