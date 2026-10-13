import { createSlice } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// ✅ رنگ‌های مهارت
export const SKILL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
  '#f97316', '#6366f1'
]

// ✅ دسته‌بندی مهارت‌ها
export const SKILL_CATEGORIES = [
  { id: 'technical', icon: 'code' },
  { id: 'creative', icon: 'palette' },
  { id: 'language', icon: 'globe' },
  { id: 'business', icon: 'briefcase' },
  { id: 'soft', icon: 'users' },
  { id: 'other', icon: 'star' }
]

// ✅ سطوح مهارت
export const SKILL_LEVELS = [
  { value: 1, key: 'beginner' },
  { value: 2, key: 'elementary' },
  { value: 3, key: 'intermediate' },
  { value: 4, key: 'advanced' },
  { value: 5, key: 'expert' }
]

const getInitialState = () => {
  try {
    const saved = localStorage.getItem('smart-planner-growth')
    if (saved) return JSON.parse(saved)
  } catch (e) {
    console.error('Error loading growth:', e)
  }
  return { journals: [], skills: [] }
}

const saveToStorage = (state) => {
  try {
    localStorage.setItem('smart-planner-growth', JSON.stringify({
      journals: state.journals,
      skills: state.skills
    }))
  } catch (e) {
    console.error('Error saving growth:', e)
  }
}

const growthSlice = createSlice({
  name: 'growth',
  initialState: getInitialState(),
  reducers: {
    // ═══════════════════════════════════════
    // ✅ ژورنال (Journal)
    // ═══════════════════════════════════════
    addJournal: (state, action) => {
      const newJournal = {
        id: uuidv4(),
        date: action.payload.date || new Date().toISOString().split('T')[0],
        mood: action.payload.mood || 3,
        energy: action.payload.energy || 3,
        wins: action.payload.wins || [],
        challenges: action.payload.challenges || [],
        reflection: action.payload.reflection || '',
        gratitude: action.payload.gratitude || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.journals.unshift(newJournal)
      saveToStorage(state)
    },
    updateJournal: (state, action) => {
      const idx = state.journals.findIndex(j => j.id === action.payload.id)
      if (idx !== -1) {
        state.journals[idx] = {
          ...state.journals[idx],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
        saveToStorage(state)
      }
    },
    deleteJournal: (state, action) => {
      state.journals = state.journals.filter(j => j.id !== action.payload)
      saveToStorage(state)
    },

    // ═══════════════════════════════════════
    // ✅ مهارت‌ها (Skills)
    // ═══════════════════════════════════════
    addSkill: (state, action) => {
      const newSkill = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description || '',
        category: action.payload.category || 'other',
        level: action.payload.level || 1,
        targetLevel: action.payload.targetLevel || 5,
        color: action.payload.color || '#3b82f6',
        hours: action.payload.hours || 0,
        sessions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      state.skills.unshift(newSkill)
      saveToStorage(state)
    },
    updateSkill: (state, action) => {
      const idx = state.skills.findIndex(s => s.id === action.payload.id)
      if (idx !== -1) {
        state.skills[idx] = {
          ...state.skills[idx],
          ...action.payload,
          updatedAt: new Date().toISOString()
        }
        saveToStorage(state)
      }
    },
    deleteSkill: (state, action) => {
      state.skills = state.skills.filter(s => s.id !== action.payload)
      saveToStorage(state)
    },
    addSkillSession: (state, action) => {
      const { skillId, minutes, notes } = action.payload
      const skill = state.skills.find(s => s.id === skillId)
      if (skill) {
        if (!skill.sessions) skill.sessions = []
        skill.sessions.push({
          id: uuidv4(),
          date: new Date().toISOString().split('T')[0],
          minutes: parseInt(minutes) || 0,
          notes: notes || '',
          createdAt: new Date().toISOString()
        })
        skill.hours = (skill.hours || 0) + (parseInt(minutes) || 0) / 60
        skill.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    deleteSkillSession: (state, action) => {
      const { skillId, sessionId } = action.payload
      const skill = state.skills.find(s => s.id === skillId)
      if (skill && skill.sessions) {
        const session = skill.sessions.find(s => s.id === sessionId)
        if (session) {
          skill.hours = Math.max(0, (skill.hours || 0) - session.minutes / 60)
          skill.sessions = skill.sessions.filter(s => s.id !== sessionId)
          skill.updatedAt = new Date().toISOString()
          saveToStorage(state)
        }
      }
    },
    updateSkillLevel: (state, action) => {
      const { skillId, level } = action.payload
      const skill = state.skills.find(s => s.id === skillId)
      if (skill) {
        skill.level = level
        skill.updatedAt = new Date().toISOString()
        saveToStorage(state)
      }
    },
    clearAllGrowth: (state) => {
      state.journals = []
      state.skills = []
      saveToStorage(state)
    }
  }
})

export const {
  addJournal,
  updateJournal,
  deleteJournal,
  addSkill,
  updateSkill,
  deleteSkill,
  addSkillSession,
  deleteSkillSession,
  updateSkillLevel,
  clearAllGrowth
} = growthSlice.actions

export default growthSlice.reducer