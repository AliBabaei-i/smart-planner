import type { ID, ISODate, DateStr } from './common'

export interface Journal {
  id: ID
  date: DateStr
  mood: number // 1-5
  energy: number // 1-5
  wins: string[]
  challenges: string[]
  reflection: string
  gratitude: string
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface SkillSession {
  id: ID
  date: DateStr
  duration: number // minutes
  notes: string
}

export interface Skill {
  id: ID
  name: string
  description: string
  category: string
  level: number // 1-5
  targetLevel: number // 1-5
  color: string
  hours: number
  sessions: SkillSession[]
  createdAt: ISODate
  updatedAt: ISODate
  deletedAt?: ISODate | null
}

export interface GrowthState {
  journals: Journal[]
  skills: Skill[]
}