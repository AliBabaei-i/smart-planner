import type { ID, ISODate, DateStr } from './common'
import type { CurrencyCode, BudgetPeriod } from './finance' 

export interface Project {
  id: ID
  name: string
  description: string
  color: string
  // ⭐ فیلدهای مربوط به مالی پروژه
  budget?: number | null
  budgetCurrency?: CurrencyCode
  budgetPeriod?: BudgetPeriod
  // متادیتا
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface ProjectsState {
  projects: Project[]
  loading: boolean
  error: string | null
  currentProject: Project | null
}