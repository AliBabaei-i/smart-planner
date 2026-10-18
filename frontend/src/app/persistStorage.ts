import { get, set, del } from 'idb-keyval'
import type { Storage } from 'redux-persist'

const persistStorage: Storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await get(key)
      return value ?? null
    } catch (error) {
      console.error(`[persistStorage] getItem failed for ${key}:`, error)
      return null
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await set(key, value)
    } catch (error) {
      console.error(`[persistStorage] setItem failed for ${key}:`, error)
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await del(key)
    } catch (error) {
      console.error(`[persistStorage] removeItem failed for ${key}:`, error)
    }
  },
}

export default persistStorage