// ═══════════════════════════════════════════════
// ✅ API قیمت‌ها — از بک‌اند خودمون (بدون CORS)
// ═══════════════════════════════════════════════

import type { MarketPrices } from '../types/finance'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export const marketApi = {
  async getPrices(): Promise<MarketPrices> {
    const res = await fetch(`${API_URL}/market/prices`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      gold18kRial: data.gold18kRial,
      silverRial: data.silverRial,
      usdRial: data.usdRial,
      fetchedAt: data.fetchedAt
    }
  },

  async refresh(): Promise<MarketPrices> {
    const res = await fetch(`${API_URL}/market/refresh`, { method: 'POST' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      gold18kRial: data.gold18kRial,
      silverRial: data.silverRial,
      usdRial: data.usdRial,
      fetchedAt: data.fetchedAt
    }
  }
}

export default marketApi