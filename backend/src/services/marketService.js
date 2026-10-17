// backend/src/services/marketService.js
// ═══════════════════════════════════════════════
// ✅ دریافت قیمت طلا، نقره، دلار از TGJU
// (server-side fetch — بدون CORS)
// ═══════════════════════════════════════════════

const TGJU_URL = 'https://call1.tgju.org/ajax.json'

let cache = { data: null, timestamp: 0 }
const CACHE_TTL = 5 * 60 * 1000 // ۵ دقیقه

// ✅ حذف کاما و تبدیل به عدد
const parseNum = (s) => {
  if (!s) return 0
  return Number(String(s).replace(/,/g, '')) || 0
}

export const getMarketPrices = async (force = false) => {
  if (!force && cache.data && Date.now() - cache.timestamp < CACHE_TTL) {
    return cache.data
  }

  const res = await fetch(TGJU_URL, {
    headers: {
      'Referer': 'https://www.tgju.org/',
      'User-Agent': 'Mozilla/5.0 (SmartPlanner/2.0)'
    }
  })

  if (!res.ok) throw new Error(`TGJU returned HTTP ${res.status}`)

  const json = await res.json()
  const c = json.current || {}

  // ✅ کلیدهای تأییدشده TGJU:
  // geram18         → طلای ۱۸ عیار، هر گرم (ریال)
  // silver_999      → نقره ۹۹۹، هر گرم (ریال)
  // price_dollar_rl → دلار بازار آزاد (ریال)
  const data = {
    gold18kRial: parseNum(c.geram18?.p),
    silverRial:  parseNum(c.silver_999?.p),
    usdRial:     parseNum(c.price_dollar_rl?.p),
    fetchedAt: new Date().toISOString()
  }

  cache = { data, timestamp: Date.now() }
  return data
}

export const clearMarketCache = () => {
  cache = { data: null, timestamp: 0 }
}