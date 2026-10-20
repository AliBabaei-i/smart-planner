import type { ID, ISODate } from './common'

export type RewardConditionType =
  | 'tasks_completed'          // تعداد کل تسک‌های انجام شده
  | 'project_tasks_completed'  // تعداد تسک‌های انجام شده در یک پروژه خاص
  | 'streak_days'              // روزهای متوالی فعالیت
  | 'pomodoro_count'           // تعداد پومودوروها
  | 'manual'                   // دستی (کاربر خودش تیک می‌زنه)

export interface Reward {
  id: ID
  title: string
  description: string
  icon: string
  color: string
  conditionType: RewardConditionType
  targetValue: number
  projectId?: ID | null
  isUnlocked: boolean
  unlockedAt?: ISODate | null
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface RewardsState {
  rewards: Reward[]
  loading: boolean
  error: string | null
}