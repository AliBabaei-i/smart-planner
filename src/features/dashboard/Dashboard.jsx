import React, { useMemo, useCallback, memo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { 
  FiSettings, 
  FiCheck, 
  FiRefreshCw, 
  FiEyeOff,
  FiPlus,
  FiEye,
  FiInfo
} from 'react-icons/fi'
import { toggleEditMode, toggleWidget, resetLayout, WIDGETS } from './dashboardSlice'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import WidgetWrapper from './WidgetWrapper'

import StatsWidget from './widgets/StatsWidget'
import TodayTasksWidget from './widgets/TodayTasksWidget'
import QuickActionsWidget from './widgets/QuickActionsWidget'
import PomodoroStatsWidget from './widgets/PomodoroStatsWidget'
import RecentTasksWidget from './widgets/RecentTasksWidget'
import UpcomingDeadlinesWidget from './widgets/UpcomingDeadlinesWidget'
import TagsWidget from './widgets/TagsWidget'
import ProjectProgressWidget from './widgets/ProjectProgressWidget'
import ProductivityWidget from './widgets/ProductivityWidget'
import ProductivityScoreWidget from './widgets/ProductivityScoreWidget'
import NotesWidget from '../notes/NotesWidget'

// ✅ خارج از کامپوننت — جلوگیری از بازتعریف
const WIDGET_COMPONENTS = {
  productivityScore: ProductivityScoreWidget,
  stats: StatsWidget,
  todayTasks: TodayTasksWidget,
  quickActions: QuickActionsWidget,
  pomodoro: PomodoroStatsWidget,
  recentTasks: RecentTasksWidget,
  upcomingDeadlines: UpcomingDeadlinesWidget,
  notes: NotesWidget,
  projectProgress: ProjectProgressWidget,
  productivity: ProductivityWidget,
  tags: TagsWidget
}

const Dashboard = () => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const { layout = [], editMode = false } = useSelector(state => state.dashboard || {})

  // ✅ useMemo برای مرتب‌سازی
  const { visibleWidgets, hiddenWidgets } = useMemo(() => {
    const sorted = [...layout].sort((a, b) => a.order - b.order)
    return {
      visibleWidgets: sorted.filter(w => w.visible),
      hiddenWidgets: sorted.filter(w => !w.visible)
    }
  }, [layout])

  const handleReset = useCallback(() => {
    if (window.confirm(t('dashboard.resetLayout') + '?')) {
      dispatch(resetLayout())
    }
  }, [dispatch, t])

  const handleToggleEditMode = useCallback(() => {
    dispatch(toggleEditMode())
  }, [dispatch])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="flex gap-2">
          {editMode ? (
            <>
              <Button variant="danger" onClick={handleReset} size="small">
                <FiRefreshCw size={14} />
                <span>{t('actions.reset')}</span>
              </Button>
              <Button onClick={handleToggleEditMode} size="small">
                <FiCheck size={14} />
                <span>{t('dashboard.saveLayout')}</span>
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={handleToggleEditMode} size="small">
              <FiSettings size={14} />
              <span>{t('dashboard.customize')}</span>
            </Button>
          )}
        </div>
      </div>

      {editMode && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <FiInfo size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <strong className="block mb-1">{t('dashboard.customize')}</strong>
              {t('dashboard.editModeHint')}
            </div>
          </div>
        </Card>
      )}

      {visibleWidgets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWidgets.map(widget => {
            const widgetInfo = WIDGETS[widget.id]
            const WidgetComponent = WIDGET_COMPONENTS[widget.id]
            
            if (!widgetInfo || !WidgetComponent) return null

            return (
              <WidgetWrapper
                key={widget.id}
                id={widget.id}
                title={t(widgetInfo.titleKey)}
                size={widget.size}
              >
                <WidgetComponent />
              </WidgetWrapper>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FiEyeOff size={36} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('dashboard.noWidgets')}
          </h3>
          <Button onClick={handleToggleEditMode}>
            <FiEye size={16} />
            <span>{t('dashboard.customize')}</span>
          </Button>
        </Card>
      )}

      {editMode && hiddenWidgets.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <FiEyeOff size={16} />
            <span>{t('dashboard.hiddenWidgets')}</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {hiddenWidgets.map(widget => {
              const widgetInfo = WIDGETS[widget.id]
              if (!widgetInfo) return null
              return (
                <button
                  key={widget.id}
                  onClick={() => dispatch(toggleWidget(widget.id))}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-sm"
                >
                  <FiPlus size={14} />
                  <span className="text-gray-700 dark:text-gray-300">
                    {t(widgetInfo.titleKey)}
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}

export default memo(Dashboard)