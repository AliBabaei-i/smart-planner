import type { ID, ISODate } from './common'

export interface Project {
  id: ID
  name: string
  description: string
  color: string
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