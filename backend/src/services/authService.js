// backend/src/services/authService.js
import crypto from 'crypto' // ✅ فقط یک بار ایمپورت شده
import { randomUUID } from 'crypto'
import { get, run, transaction } from '../db/index.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { generateTokenPair } from '../utils/jwt.js'
import logger from '../utils/logger.js'

export const findUserByEmail = (email) => {
  return get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()])
}

export const findUserById = (id) => {
  return get(
    'SELECT id, email, name, settings, created_at, last_login_at FROM users WHERE id = ?',
    [id]
  )
}

export const createUser = async ({ email, password, name }) => {
  const normalizedEmail = email.toLowerCase().trim()

  const existing = findUserByEmail(normalizedEmail)
  if (existing) {
    const error = new Error('Email already registered')
    error.statusCode = 409
    throw error
  }

  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()
  const userId = randomUUID()

  return transaction(() => {
    run(
      `INSERT INTO users (id, email, password_hash, name, settings, created_at, updated_at, last_login_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, normalizedEmail, passwordHash, name || null, '{}', now, now, now]
    )

    run(
      `INSERT INTO finance_settings (user_id, categories, islamic_settings, currency_settings, settings, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        JSON.stringify({ income: [], expense: [] }),
        JSON.stringify({
          khumsYearStart: null,
          khumsPaid: 0,
          goldNisabGrams: 87.48,
          silverNisabGrams: 612.36,
          goldPricePerGram: 5000000,
          silverPricePerGram: 80000,
          showKhumsWidget: true,
          showZakatWidget: true,
          warnOnInterest: true
        }),
        JSON.stringify({
          baseCurrency: 'IRR',
          displayCurrency: 'IRT',
          rates: { USD: 600000, EUR: 650000, GOLD_GRAM: 5000000, SILVER_GRAM: 80000 },
          lastUpdated: now
        }),
        JSON.stringify({}),
        now
      ]
    )

    run(
      `INSERT INTO dashboard_layouts (user_id, layout, edit_mode, updated_at)
       VALUES (?, ?, ?, ?)`,
      [userId, '[]', 0, now]
    )

    run(
      `INSERT INTO achievements (user_id, data, updated_at)
       VALUES (?, ?, ?)`,
      [userId, JSON.stringify({ unlocked: [], totalPoints: 0 }), now]
    )

    logger.success(`User created: ${normalizedEmail}`)
    return findUserById(userId)
  })
}

export const authenticateUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim()
  const user = findUserByEmail(normalizedEmail)
  
  if (!user) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    const error = new Error('Invalid email or password')
    error.statusCode = 401
    throw error
  }

  const now = new Date().toISOString()
  run('UPDATE users SET last_login_at = ? WHERE id = ?', [now, user.id])

  logger.success(`User logged in: ${normalizedEmail}`)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    settings: JSON.parse(user.settings || '{}'),
    created_at: user.created_at,
    last_login_at: now
  }
}

export const createTokensForUser = (user) => {
  return generateTokenPair(user)
}

// ═══════════════════════════════════════════════
// ✅ Invalidate Sessions
// ═══════════════════════════════════════════════
export const invalidateAllSessions = (userId) => {
  try {
    const now = new Date().toISOString()
    run(`UPDATE users SET sessions_invalidated_at = ? WHERE id = ?`, [now, userId])
    logger.warn(`🔒 All sessions invalidated for user ${userId}`)
    return true
  } catch (error) {
    logger.error(`invalidateAllSessions error: ${error.message}`)
    return false
  }
}

export const isSessionValid = (userId, tokenIssuedAt) => {
  try {
    const user = get(`SELECT sessions_invalidated_at FROM users WHERE id = ?`, [userId])
    if (!user || !user.sessions_invalidated_at) return true
    const invalidatedAt = new Date(user.sessions_invalidated_at).getTime()
    return tokenIssuedAt >= invalidatedAt
  } catch (error) {
    logger.error(`isSessionValid error: ${error.message}`)
    return true // fail-open
  }
}

// ═══════════════════════════════════════════════
// ✅ Password Reset
// ═══════════════════════════════════════════════
export const generateResetToken = (email) => {
  const user = findUserByEmail(email)
  if (!user) return null

  // ✅ استفاده از crypto که در بالا ایمپورت شد
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()

  run(
    `UPDATE users SET reset_token = ?, reset_expires_at = ? WHERE id = ?`,
    [token, expiresAt, user.id]
  )

  return { token, user }
}

export const resetPassword = async (token, newPassword) => {
  const user = get(`SELECT * FROM users WHERE reset_token = ?`, [token])

  if (!user) {
    const error = new Error('Invalid or expired reset token')
    error.statusCode = 400
    throw error
  }

  if (new Date(user.reset_expires_at) < new Date()) {
    const error = new Error('Reset token has expired')
    error.statusCode = 400
    throw error
  }

  const passwordHash = await hashPassword(newPassword)
  run(
    `UPDATE users
     SET password_hash = ?, reset_token = NULL, reset_expires_at = NULL,
         sessions_invalidated_at = ?
     WHERE id = ?`,
    [passwordHash, new Date().toISOString(), user.id]
  )

  logger.success(`Password reset for ${user.email}`)
  return { success: true }
}

export default {
  findUserByEmail,
  findUserById,
  createUser,
  authenticateUser,
  createTokensForUser,
  invalidateAllSessions,
  isSessionValid,
  generateResetToken,
  resetPassword
}