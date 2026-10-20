import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'
import type { Reward } from '../../types/rewards'

interface RewardsState {
  rewards: Reward[]
  loading: boolean
  error: string | null
}

const initialState: RewardsState = {
  rewards: [],
  loading: false,
  error: null
}

const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    addReward: (state, action: PayloadAction<Partial<Reward>>) => {
      const now = new Date().toISOString()
      state.rewards.unshift({
        id: uuidv4(),
        title: action.payload.title || 'پاداش بدون نام',
        description: action.payload.description || '',
        icon: action.payload.icon || '🎁',
        color: action.payload.color || '#8b5cf6',
        conditionType: action.payload.conditionType || 'tasks_completed',
        targetValue: action.payload.targetValue || 1,
        projectId: action.payload.projectId || null,
        isUnlocked: false,
        createdAt: now,
        updatedAt: now
      })
    },
    updateReward: (state, action: PayloadAction<{ id: string; updates: Partial<Reward> }>) => {
      const index = state.rewards.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.rewards[index] = {
          ...state.rewards[index],
          ...action.payload.updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    deleteReward: (state, action: PayloadAction<string>) => {
      state.rewards = state.rewards.filter(r => r.id !== action.payload)
    },
    unlockReward: (state, action: PayloadAction<string>) => {
      const reward = state.rewards.find(r => r.id === action.payload)
      if (reward && !reward.isUnlocked) {
        reward.isUnlocked = true
        reward.unlockedAt = new Date().toISOString()
        reward.updatedAt = new Date().toISOString()
      }
    },
    resetRewards: (state) => {
      state.rewards = []
    }
  }
})

export const { addReward, updateReward, deleteReward, unlockReward, resetRewards } = rewardsSlice.actions
export default rewardsSlice.reducer