import { api } from './api'

// ═══════════════════════════════════════════════
// ✅ Sync API
// ═══════════════════════════════════════════════
export const syncApi = {
  // ✅ Push changes به server
  async push(changes) {
    if (!changes || changes.length === 0) {
      return { success: true, applied: 0, conflicts: 0, errors: [] }
    }

    try {
      const data = await api.post('/sync/push', { changes })
      return data
    } catch (error) {
      console.error('Sync push error:', error)
      throw error
    }
  },

  // ✅ Pull changes از server
  async pull(since = null) {
    try {
      const url = since ? `/sync/pull?since=${encodeURIComponent(since)}` : '/sync/pull'
      const data = await api.get(url)
      return data
    } catch (error) {
      console.error('Sync pull error:', error)
      throw error
    }
  },

  // ✅ Full sync (push + pull)
  async full(changes, since) {
    try {
      const data = await api.post('/sync/full', { changes, since })
      return data
    } catch (error) {
      console.error('Sync full error:', error)
      throw error
    }
  },

  // ✅ چک وضعیت
  async status() {
    try {
      return await api.get('/sync/status')
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // ✅ Reset همه داده‌های کاربر از سرور
  async reset() {
    try {
      const data = await api.delete('/sync/reset')
      return data
    } catch (error) {
      console.error('Sync reset error:', error)
      throw error
    }
  }
}

export default syncApi