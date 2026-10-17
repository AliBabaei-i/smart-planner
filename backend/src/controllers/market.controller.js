// backend/src/controllers/market.controller.js
import { getMarketPrices, clearMarketCache } from '../services/marketService.js'
import logger from '../utils/logger.js'

export const getPrices = async (req, res, next) => {
  try {
    const force = req.query.refresh === 'true'
    const data = await getMarketPrices(force)
    res.json({ success: true, ...data })
  } catch (error) {
    logger.error(`Market price error: ${error.message}`)
    next(error)
  }
}

export const refreshPrices = async (req, res, next) => {
  try {
    clearMarketCache()
    const data = await getMarketPrices(true)
    res.json({ success: true, ...data })
  } catch (error) {
    logger.error(`Market refresh error: ${error.message}`)
    next(error)
  }
}