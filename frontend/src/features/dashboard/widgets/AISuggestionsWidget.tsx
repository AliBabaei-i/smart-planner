import React, { useMemo, memo } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  FiZap, FiAlertTriangle, FiClock, FiTrendingUp, FiAward,
  FiFolder, FiCalendar, FiArrowRight, FiCheckCircle,
} from 'react-icons/fi'
import type { RootState } from '../../../app/store'

interface Suggestion {
  key: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bg: string
  title: string
  description: string
  actionPath?: string
  priority: 'urgent' | 'high' | 'normal' | 'info'
}

const AISuggestionsWidget = memo(() => {
  const { i18n } = useTranslation()
  const isPersian = i18n.language === 'fa' || i18n.language?.startsWith('fa')

  const tasks = useSelector((s: RootState) => s.tasks?.tasks ?? []) as any[]
  const projects = useSelector((s: RootState) => s.projects?.projects ?? []) as any[]
  const habits = useSelector((s: RootState) => (s as any).habits?.habits ?? []) as any[]

  const suggestions = useMemo<Suggestion[]>(() => {
    const result: Suggestion[] = []
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    // ─── ۱. کارهای عقب‌افتاده ───
    const overdue = tasks.filter(
      (t) => !t.completed && t.dueDate && t.dueDate < today
    )
    if (overdue.length > 0) {
      result.push({
        key: 'overdue',
        icon: FiAlertTriangle,
        color: 'text-red-600',
        bg: 'bg-red-50 dark:bg-red-900/20',
        title: `${overdue.length} ${isPersian ? 'کار عقب‌افتاده' : 'overdue tasks'}`,
        description: isPersian
          ? 'بهترین کار: امروز یکی از آن‌ها را انجام بده'
          : 'Best action: pick one to do today',
        actionPath: '/tasks',
        priority: 'urgent',
      })
    }

    // ─── ۲. کارهای ددلاین فردا ───
    const tomorrowTasks = tasks.filter(
      (t) => !t.completed && t.dueDate === tomorrow
    )
    if (tomorrowTasks.length > 0) {
      result.push({
        key: 'tomorrow',
        icon: FiClock,
        color: 'text-amber-600',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        title: `${tomorrowTasks.length} ${isPersian ? 'ددلاین فردا' : 'due tomorrow'}`,
        description: isPersian
          ? 'امروز برای فردا آماده شو'
          : 'Prepare today for tomorrow',
        actionPath: '/tasks',
        priority: 'high',
      })
    }

    // ─── ۳. ساعت اوج بهره‌وری ───
    const completedWithTime = tasks.filter((t) => t.completed && t.completedAt)
    if (completedWithTime.length >= 3) {
      const hoursMap: Record<number, number> = {}
      completedWithTime.forEach((t) => {
        const h = new Date(t.completedAt).getHours()
        hoursMap[h] = (hoursMap[h] || 0) + 1
      })
      const sorted = Object.entries(hoursMap).sort((a, b) => b[1] - a[1])
      if (sorted[0]) {
        const bestHour = parseInt(sorted[0][0])
        result.push({
          key: 'best_hour',
          icon: FiTrendingUp,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          title: isPersian
            ? `ساعت اوج تو: ${bestHour}:00`
            : `Peak hour: ${bestHour}:00`,
          description: isPersian
            ? 'در این ساعت بیشترین تمرکز را داری'
            : 'Your best focus time',
          priority: 'info',
        })
      }
    }

    // ─── ۴. پروژه‌ای که نیاز به توجه دارد ───
    const projectStats = projects
      .map((p) => ({
        project: p,
        pending: tasks.filter((t) => t.projectId === p.id && !t.completed).length,
      }))
      .filter((s) => s.pending > 0)
      .sort((a, b) => b.pending - a.pending)

    if (projectStats[0] && projectStats[0].pending >= 3) {
      result.push({
        key: 'project_attention',
        icon: FiFolder,
        color: 'text-blue-600',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        title: projectStats[0].project.name,
        description: isPersian
          ? `${projectStats[0].pending} کار در انتظار`
          : `${projectStats[0].pending} tasks pending`,
        actionPath: '/projects',
        priority: 'normal',
      })
    }

    // ─── ۵. زنجیره‌ی عادت ───
    const topStreak = habits
      .filter((h) => (h.streak || 0) >= 3)
      .sort((a, b) => (b.streak || 0) - (a.streak || 0))[0]
    if (topStreak) {
      result.push({
        key: 'streak',
        icon: FiAward,
        color: 'text-orange-600',
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        title: topStreak.name,
        description: isPersian
          ? `${topStreak.streak} روز زنجیره — ادامه بده!`
          : `${topStreak.streak}-day streak — keep going!`,
        actionPath: '/habits',
        priority: 'info',
      })
    }

    // ─── ۶. امروز خالی ───
    const todayTasks = tasks.filter(
      (t) => !t.completed && t.dueDate === today
    )
    if (todayTasks.length === 0 && tasks.length > 0) {
      result.push({
        key: 'plan_today',
        icon: FiCalendar,
        color: 'text-purple-600',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        title: isPersian
          ? 'امروز برنامه‌ای نداری'
          : 'Nothing planned today',
        description: isPersian
          ? 'از برنامه‌ریزی هفتگی استفاده کن'
          : 'Use weekly planning',
        actionPath: '/planning',
        priority: 'normal',
      })
    }

    return result.slice(0, 4)
  }, [tasks, projects, habits, isPersian])

  // ─── Empty ───
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-12 h-12 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-2">
          <FiCheckCircle size={22} className="text-emerald-500" />
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {isPersian ? 'همه چیز خوب پیش می‌رود!' : 'All good!'}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          {isPersian ? 'پیشنهاد جدیدی نیست' : 'No new suggestions'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-2">
        <FiZap size={12} className="text-yellow-500" />
        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {isPersian ? 'پیشنهادهای هوشمند' : 'Smart Suggestions'}
        </span>
      </div>
      {suggestions.map((s) => {
        const Icon = s.icon
        return (
          <div
            key={s.key}
            className={`flex items-start gap-2.5 p-2.5 rounded-lg ${s.bg} transition-colors`}
          >
            <div className={`w-7 h-7 rounded-lg bg-white/60 dark:bg-black/20 flex items-center justify-center flex-shrink-0`}>
              <Icon size={13} className={s.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-900 dark:text-white truncate">
                {s.title}
              </div>
              <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                {s.description}
              </div>
            </div>
            {s.actionPath && (
              <Link
                to={s.actionPath}
                className={`text-[10px] font-medium flex items-center gap-0.5 flex-shrink-0 ${s.color} hover:underline`}
              >
                {isPersian ? <FiArrowRight size={10} /> : <FiArrowRight size={10} className="rotate-180" />}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )
})

AISuggestionsWidget.displayName = 'AISuggestionsWidget'
export default AISuggestionsWidget