// backend/src/routes/market.routes.js
import express from 'express'
import { getPrices, refreshPrices } from '../controllers/market.controller.js'

const router = express.Router()

// ✅ عمومی — نیازی به auth نداره
router.get('/prices', getPrices)
router.post('/refresh', refreshPrices)

export default router