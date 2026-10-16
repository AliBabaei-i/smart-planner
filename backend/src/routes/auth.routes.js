import express from 'express'
import {
  signup,
  signin,
  refresh,
  me,
  signout,
  signupSchema,
  signinSchema,
  refreshSchema
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = express.Router()

router.post('/signup', authLimiter, validate(signupSchema), signup)
router.post('/signin', authLimiter, validate(signinSchema), signin)
router.post('/refresh', validate(refreshSchema), refresh)

router.get('/me', requireAuth, me)
router.post('/signout', requireAuth, signout)

export default router