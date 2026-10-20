import React, { Component, type ReactNode } from 'react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

interface Props {
  children: ReactNode
  widgetName: string
}

interface State {
  hasError: boolean
  error: Error | null
}

class WidgetErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`[Widget:${this.props.widgetName}] crashed:`, error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 text-red-500">
          <FiAlertTriangle size={28} className="mb-2" />
          <p className="text-xs font-semibold">ویجت خطا داد</p>
          <p className="text-[10px] text-gray-400 mt-1">{this.props.widgetName}</p>
          {import.meta.env.DEV && this.state.error && (
            <p className="text-[9px] text-red-400 mt-1 line-clamp-2">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleReset}
            className="mt-3 flex items-center gap-1 text-[10px] px-2 py-1 rounded bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100"
          >
            <FiRefreshCw size={10} />
            <span>تلاش مجدد</span>
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default WidgetErrorBoundary