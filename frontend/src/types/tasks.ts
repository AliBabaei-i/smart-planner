import type { ID, ISODate, DateStr, TimeStr } from './common'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TaskStatus = 'todo' | 'in_progress' | 'completed'
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'yearly' | null

export interface Subtask {
  id: ID
  title: string
  completed: boolean
  createdAt: ISODate
}

export interface Task {
  id: ID
  title: string
  description: string
  projectId: ID | null
  priority: TaskPriority
  status: TaskStatus
  dueDate: DateStr | null
  dueTime: TimeStr | null
  timeEstimate: number | null
  actualTime: number
  completed: boolean
  subtasks: Subtask[]
  notes: string
  tags: string[]
  recurring: RecurringType
  recurringEndDate: DateStr | null
  parentTaskId: ID | null
  // فیلدهای مرتبط با مالی
  financialCost?: number | null
  financialCategory?: string | null
  financialTransactionId?: ID | null
  // متادیتا
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface TasksState {
  tasks: Task[]
  availableTags: string[]
  loading: boolean
  error: string | null
  currentTask: Task | null
}