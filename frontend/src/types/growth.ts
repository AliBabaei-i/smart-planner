import type { ID, ISODate, DateStr } from './common'

export interface Journal {
  id: ID
  date: DateStr
  mood: number
  energy: number
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
  duration: number
  notes: string
}

export interface Skill {
  id: ID
  name: string
  description: string
  category: string
  level: string
  targetLevel: string
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