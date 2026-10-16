import { z } from 'zod'
import {
  createUser,
  authenticateUser,
  createTokensForUser,
  findUserById
} from '../services/authService.js'
import { verifyToken, generateAccessToken } from '../utils/jwt.js'
import logger from '../utils/logger.js'

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(100)
  })
})

export const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required')
  })
})

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
})

export const signup = async (req, res, next) => {
  try {
    const { email, password, name } = req.body

    const user = await createUser({ email, password, name })
    const tokens = createTokensForUser(user)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      ...tokens
    })
  } catch (error) {
    logger.error('Signup error:', error.message)
    next(error)
  }
}

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await authenticateUser({ email, password })
    const tokens = createTokensForUser(user)

    res.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        settings: user.settings
      },
      ...tokens
    })
  } catch (error) {
    logger.error('Signin error:', error.message)
    next(error)
  }
}

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    const decoded = verifyToken(refreshToken)
    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      })
    }

    const user = findUserById(decoded.userId)
    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User no longer exists'
      })
    }

    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    })

    res.json({
      success: true,
      accessToken: newAccessToken
    })
  } catch (error) {
    logger.error('Refresh error:', error.message)
    next(error)
  }
}

export const me = async (req, res, next) => {
  try {
    const user = findUserById(req.userId)
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        settings: JSON.parse(user.settings || '{}'),
        created_at: user.created_at,
        last_login_at: user.last_login_at
      }
    })
  } catch (error) {
    logger.error('Me error:', error.message)
    next(error)
  }
}

export const signout = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Signed out successfully'
    })
  } catch (error) {
    next(error)
  }
}

export default { signup, signin, refresh, me, signout }