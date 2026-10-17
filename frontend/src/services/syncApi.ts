// frontend/src/services/syncApi.ts
import { api } from './api'

// ═══════════════════════════════════════════════
// ✅ Typeها
// ═══════════════════════════════════════════════

export interface SyncChange {
  entity: string
  data: Record<string, any>
}

export interface SyncPushResult {
  success: boolean
  applied: number
  conflicts: number
  skipped?: number
  errors: Array<{ entity?: string; id?: string; message: string }>
}

export interface SyncPullResult {
  success: boolean
  serverTime: string
  entities: Record<string, any[]>
}

export interface SyncFullResult {
  success: boolean
  push: SyncPushResult
  pull: SyncPullResult
}

export interface SyncStatus {
  success: boolean
  error?: string
}

// ═══════════════════════════════════════════════
// ✅ API
// ═══════════════════════════════════════════════

export const syncApi = {
  async push(changes: SyncChange[]): Promise<SyncPushResult> {
    if (!changes || changes.length === 0) {
      return { success: true, applied: 0, conflicts: 0, errors: [] }
    }

    try {
      const data = await api.post<SyncPushResult>('/sync/push', { changes })
      return data
    } catch (error) {
      console.error('Sync push error:', error)
      throw error
    }
  },

  async pull(since: string | null = null): Promise<SyncPullResult> {
    try {
      const url = since
        ? `/sync/pull?since=${encodeURIComponent(since)}`
        : '/sync/pull'
      const data = await api.get<SyncPullResult>(url)
      return data
    } catch (error) {
      console.error('Sync pull error:', error)
      throw error
    }
  },

  async full(changes: SyncChange[], since: string | null): Promise<SyncFullResult> {
    try {
      const data = await api.post<SyncFullResult>('/sync/full', { changes, since })
      return data
    } catch (error) {
      console.error('Sync full error:', error)
      throw error
    }
  },

  async status(): Promise<SyncStatus> {
    try {
      return await api.get<SyncStatus>('/sync/status')
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  },

  async reset(): Promise<{ success: boolean; deleted?: number }> {
    try {
      const data = await api.delete<{ success: boolean; deleted?: number }>('/sync/reset')
      return data
    } catch (error) {
      console.error('Sync reset error:', error)
      throw error
    }
  }
}

export default syncApi