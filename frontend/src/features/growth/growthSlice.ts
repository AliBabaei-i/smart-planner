import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

export interface Journal {
  id: string
  date: string
  mood: number
  energy: number
  wins: string[]
  challenges: string[]
  reflection: string
  gratitude: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface SkillSession {
  id: string
  date: string
  duration: number
  notes: string
}

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: string
  targetLevel: string
  color: string
  hours: number
  sessions: SkillSession[]
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

export interface GrowthState {
  journals: Journal[]
  skills: Skill[]
}

// ✅ ثابت‌های Growth
export const SKILL_LEVELS = [
  { id: 'beginner', name: 'مبتدی' },
  { id: 'elementary', name: 'مقدماتی' },
  { id: 'intermediate', name: 'متوسط' },
  { id: 'advanced', name: 'پیشرفته' },
  { id: 'expert', name: 'متخصص' }
] as const

export const SKILL_CATEGORIES = [
  { id: 'technical', name: 'فنی' },
  { id: 'creative', name: 'خلاقانه' },
  { id: 'language', name: 'زبانی' },
  { id: 'business', name: 'کسب و کار' },
  { id: 'soft', name: 'مهارت نرم' },
  { id: 'other', name: 'سایر' }
] as const

export const SKILL_COLORS = [
  '#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'
] as const

const initialState: GrowthState = { journals: [], skills: [] }

const growthSlice = createSlice({
  name: 'growth',
  initialState,
  reducers: {
    addJournal: (state, action: PayloadAction<Partial<Journal> & { date: string }>) => {
      state.journals.push({
        id: uuidv4(),
        date: action.payload.date,
        mood: action.payload.mood || 3,
        energy: action.payload.energy || 3,
        wins: action.payload.wins || [],
        challenges: action.payload.challenges || [],
        reflection: action.payload.reflection || '',
        gratitude: action.payload.gratitude || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateJournal: (state, action: PayloadAction<Partial<Journal> & { id: string }>) => {
      const idx = state.journals.findIndex(j => j.id === action.payload.id)
      if (idx !== -1) state.journals[idx] = { ...state.journals[idx], ...action.payload, updatedAt: new Date().toISOString() }
    },
    deleteJournal: (state, action: PayloadAction<string>) => {
      state.journals = state.journals.filter(j => j.id !== action.payload)
    },
    addSkill: (state, action: PayloadAction<Partial<Skill> & { name: string }>) => {
      state.skills.push({
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        category: action.payload.category || 'other',
        level: action.payload.level || 'beginner',
        targetLevel: action.payload.targetLevel || 'intermediate',
        color: action.payload.color || '#8b5cf6',
        hours: 0,
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    },
    updateSkill: (state, action: PayloadAction<Partial<Skill> & { id: string }>) => {
      const idx = state.skills.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) state.skills[idx] = { ...state.skills[idx], ...action.payload, updatedAt: new Date().toISOString() }
    },
    deleteSkill: (state, action: PayloadAction<string>) => {
      state.skills = state.skills.filter(s => s.id !== action.payload)
    },
    addSkillSession: (state, action: PayloadAction<{ skillId: string; duration: number; notes: string; date: string }>) => {
      const skill = state.skills.find(s => s.id === action.payload.skillId)
      if (skill) {
        skill.sessions.push({ id: uuidv4(), date: action.payload.date, duration: action.payload.duration, notes: action.payload.notes })
        skill.hours += action.payload.duration / 60
        skill.updatedAt = new Date().toISOString()
      }
    },
    deleteSkillSession: (state, action: PayloadAction<{ skillId: string; sessionId: string }>) => {
      const skill = state.skills.find(s => s.id === action.payload.skillId)
      if (skill) {
        const session = skill.sessions.find(s => s.id === action.payload.sessionId)
        if (session) {
          skill.hours = Math.max(0, skill.hours - session.duration / 60)
          skill.sessions = skill.sessions.filter(s => s.id !== action.payload.sessionId)
          skill.updatedAt = new Date().toISOString()
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase('sync/mergeJournals', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) { state.journals = state.journals.filter(j => j.id !== remote.id); continue }
        const idx = state.journals.findIndex(j => j.id === remote.id)
        if (idx === -1) state.journals.push(remote)
        else if (new Date(remote.updatedAt || 0) > new Date(state.journals[idx].updatedAt || 0)) state.journals[idx] = { ...state.journals[idx], ...remote }
      }
    })
    builder.addCase('sync/mergeSkills', (state, action: any) => {
      const remoteItems = action.payload?.items || []
      for (const remote of remoteItems) {
        if (remote.deletedAt || remote.deleted_at) { state.skills = state.skills.filter(s => s.id !== remote.id); continue }
        const idx = state.skills.findIndex(s => s.id === remote.id)
        if (idx === -1) state.skills.push(remote)
        else if (new Date(remote.updatedAt || 0) > new Date(state.skills[idx].updatedAt || 0)) state.skills[idx] = { ...state.skills[idx], ...remote }
      }
    })
  }
})

export const { addJournal, updateJournal, deleteJournal, addSkill, updateSkill, deleteSkill, addSkillSession, deleteSkillSession } = growthSlice.actions
export default growthSlice.reducer