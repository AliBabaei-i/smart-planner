import { verifyToken } from '../utils/jwt.js'
import { get } from '../db/index.js'
import { isSessionValid } from '../services/authService.js'

export const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      })
    }

    const user = get(
      'SELECT id, email, name FROM users WHERE id = ?',
      [decoded.userId]
    )

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User no longer exists'
      })
    }

    // ✅ چک کن session باطل نشده باشه
    // JWT iat به ثانیه‌ست، پس × ۱۰۰۰ می‌کنیم
    const tokenIssuedAt = (decoded.iat || 0) * 1000

    if (!isSessionValid(user.id, tokenIssuedAt)) {
      return res.status(401).json({
        error: 'Session invalidated',
        message: 'Your session was invalidated. Please login again.',
        code: 'SESSION_INVALIDATED'
      })
    }

    req.user = user
    req.userId = user.id
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'Server error',
      message: 'Internal authentication error'
    })
  }
}

export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next()
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (decoded) {
      const user = get(
        'SELECT id, email, name FROM users WHERE id = ?',
        [decoded.userId]
      )

      if (user) {
        const tokenIssuedAt = (decoded.iat || 0) * 1000
        if (isSessionValid(user.id, tokenIssuedAt)) {
          req.user = user
          req.userId = user.id
        }
      }
    }

    next()
  } catch (error) {
    next()
  }
}

export default { requireAuth, optionalAuth }