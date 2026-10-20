import type { ID, ISODate, DateStr } from './common'

export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived'

export interface Milestone {
  id: ID
  title: string
  completed: boolean
}

export interface Goal {
  id: ID
  title: string
  description: string
  category: string
  status: GoalStatus
  color: string
  startDate: DateStr | null
  targetDate: DateStr | null
  milestones: Milestone[]
  archived: boolean
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface GoalsState {
  goals: Goal[]
}