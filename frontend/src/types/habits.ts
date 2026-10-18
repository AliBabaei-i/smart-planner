import type { ID, ISODate, DateStr } from './common'

export interface Habit {
  id: ID
  name: string
  description: string
  iconId: string
  color: string
  archived: boolean
  completions?: Record<string, Record<string, boolean>> // [habitId]: { [date]: true }
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface HabitsState {
  habits: Habit[]
  completions: Record<string, Record<string, boolean>> // [habitId]: { [dateStr]: true }
  loading: boolean
  error: string | null
}